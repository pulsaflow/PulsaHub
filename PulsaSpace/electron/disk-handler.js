/**
 * PulsaSpace — Gestion disque et nettoyage
 * Scan d'arborescence, analyse des fichiers nettoyables.
 */

const fs = require('fs')
const path = require('path')
const os = require('os')

/**
 * Mappe DriveType WMI vers libellé.
 */
function getDriveTypeLabel(driveType, mediaType, busType) {
  if (driveType === 2) return 'USB'
  if (driveType === 4) return 'Réseau'
  if (driveType === 5) return 'CD/DVD'
  if (driveType === 3) {
    if (mediaType && mediaType.toLowerCase().includes('ssd')) return 'SSD'
    if (busType && busType.toLowerCase().includes('nvme')) return 'NVMe'
    if (mediaType && mediaType.toLowerCase().includes('hdd')) return 'HDD'
    return 'Local'
  }
  return 'Local'
}

/**
 * Retourne la liste des disques avec taille, type, système de fichiers.
 */
function getDrives() {
  const drives = []
  if (process.platform === 'win32') {
    const { execSync } = require('child_process')
    try {
      const out = execSync('wmic logicaldisk get caption,freespace,size,drivetype,filesystem', {
        encoding: 'utf-8',
      })
      const lines = out.trim().split('\n').slice(1)
      let physicalDiskTypes = {}
      try {
        const psOut = execSync(
          'powershell -NoProfile -Command "Get-PhysicalDisk | Select-Object DeviceId, MediaType, BusType | ConvertTo-Json -Compress"',
          { encoding: 'utf-8' }
        )
        const disks = JSON.parse(psOut)
        const arr = Array.isArray(disks) ? disks : [disks]
        arr.forEach((d) => {
          if (d && d.DeviceId !== undefined) {
            physicalDiskTypes[d.DeviceId] = {
              mediaType: d.MediaType || '',
              busType: d.BusType || '',
            }
          }
        })
      } catch (_) {}

      for (const line of lines) {
        const parts = line.trim().split(/\s+/).filter(Boolean)
        if (parts.length >= 3) {
          const letter = parts[0]
          const free = parseInt(parts[1], 10) || 0
          const total = parseInt(parts[2], 10) || 0
          const used = total > 0 ? total - free : 0
          const driveType = parseInt(parts[3], 10) || 3
          const fileSystem = parts[4] || ''
          const phys = physicalDiskTypes[0] || {}
          const typeLabel = getDriveTypeLabel(driveType, phys.mediaType, phys.busType)
          const label = letter === 'C:' ? 'Disque local (C:)' : `Disque (${letter})`
          drives.push({
            letter,
            label,
            total,
            free,
            used,
            driveType,
            fileSystem: fileSystem || null,
            typeLabel,
          })
        }
      }
      if (drives.length === 0) {
        drives.push({
          letter: 'C:',
          label: 'Disque local (C:)',
          total: 0,
          free: 0,
          used: 0,
          typeLabel: 'Local',
          fileSystem: null,
        })
      }
    } catch (err) {
      drives.push({
        letter: 'C:',
        label: 'Disque local (C:)',
        total: 0,
        free: 0,
        used: 0,
        typeLabel: 'Local',
        fileSystem: null,
      })
    }
  } else {
    const homedir = os.homedir()
    drives.push({
      letter: homedir,
      label: 'Dossier personnel',
      total: 0,
      free: 0,
      used: 0,
      typeLabel: 'Local',
      fileSystem: null,
    })
  }
  return drives
}

/** Dossiers système à ignorer (Windows) */
const SKIP_SYSTEM_NAMES = new Set([
  'System Volume Information',
  '$Recycle.Bin',
  '$RECYCLE.BIN',
  'Recovery',
  'Config.Msi',
  'Documents and Settings',
])

function shouldSkipDir(dirName, opts) {
  if (!opts.skipSystem) return false
  return SKIP_SYSTEM_NAMES.has(dirName)
}

function isJunctionOrSymlink(fullPath) {
  try {
    const stat = fs.lstatSync(fullPath)
    return stat.isSymbolicLink ? stat.isSymbolicLink() : false
  } catch {
    return false
  }
}

/** Flag d'annulation du scan en cours */
let scanCancelled = false

/**
 * Scanne un dossier de façon asynchrone avec progression et annulation.
 */
function scanFolderAsync(folderPath, opts = {}) {
  const maxDepth = opts.maxDepth ?? 8
  const skipSystem = opts.skipSystem !== false
  const skipJunctions = opts.skipJunctions !== false
  const onProgress = opts.onProgress || (() => {})
  scanCancelled = false

  const startTime = Date.now()
  let fileCount = 0
  let folderCount = 0
  const inaccessiblePaths = []
  const nodeMap = new Map()
  let topFiles = [] // Tableau des plus gros fichiers

  return new Promise((resolve) => {
    nodeMap.set(folderPath, {
      name: path.basename(folderPath) || '(racine)',
      path: folderPath,
      size: 0,
      children: [],
    })
    const queue = [{ dirPath: folderPath, depth: 0, parentPath: null }]
    const run = () => {
      const process = () => {
        if (queue.length === 0 || scanCancelled) {
          const root = nodeMap.get(folderPath)
          if (root) {
            const sortChildren = (n) => {
              if (n.children && n.children.length) {
                n.children.sort((a, b) => (b.size || 0) - (a.size || 0))
                n.children = n.children.slice(0, 100)
                n.children.forEach(sortChildren)
              }
            }
            sortChildren(root)
          }
          // On s'assure de ne renvoyer que les 100 plus gros fichiers à la fin
          topFiles.sort((a, b) => b.size - a.size)
          topFiles = topFiles.slice(0, 100)

          resolve({
            tree: scanCancelled ? null : root,
            fileCount,
            folderCount,
            inaccessiblePaths,
            topFiles,
            duration: Math.round((Date.now() - startTime) / 1000),
            cancelled: scanCancelled,
          })
          return
        }
        const { dirPath, depth, parentPath } = queue.shift()
        const name = path.basename(dirPath) || dirPath
        let mtime = null
        try {
          mtime = fs.statSync(dirPath).mtimeMs
        } catch (_) {}
        const node = { name: name || '(racine)', path: dirPath, size: 0, fileCount: 0, mtime, children: [] }
        nodeMap.set(dirPath, node)

        let entries = []
        try {
          entries = fs.readdirSync(dirPath, { withFileTypes: true })
        } catch (err) {
          inaccessiblePaths.push({ path: dirPath, error: err.message })
          if (parentPath) {
            const parent = nodeMap.get(parentPath)
            if (parent) {
              parent.children.push({ ...node, inaccessible: true })
              parent.size += node.size
            }
          }
          setImmediate(process)
          return
        }

        let fileSize = 0
        let localFileCount = 0
        for (const entry of entries) {
          if (scanCancelled) break
          const fullPath = path.join(dirPath, entry.name)
          try {
            if (entry.isDirectory()) {
              if (['.', '..'].includes(entry.name)) continue
              if (shouldSkipDir(entry.name, { skipSystem })) continue
              if (skipJunctions && isJunctionOrSymlink(fullPath)) continue
              if (depth < maxDepth) {
                queue.push({ dirPath: fullPath, depth: depth + 1, parentPath: dirPath })
              }
            } else {
              const s = fs.statSync(fullPath).size
              fileSize += s
              localFileCount++
              fileCount++
              
              // Gestion du Top 100
              if (s > 0) {
                if (topFiles.length < 100 || s > topFiles[topFiles.length - 1].size) {
                  let fMtime = null
                  try { fMtime = fs.statSync(fullPath).mtimeMs } catch (_) {}
                  topFiles.push({ name: entry.name, path: fullPath, size: s, mtime: fMtime })
                  topFiles.sort((a, b) => b.size - a.size)
                  if (topFiles.length > 100) topFiles.pop()
                }
              }
            }
          } catch (_) {}
        }

        node.size = fileSize
        node.fileCount = localFileCount
        folderCount++
        onProgress({ folderCount, fileCount, currentPath: dirPath, inaccessibleCount: inaccessiblePaths.length })

        if (parentPath) {
          const parent = nodeMap.get(parentPath)
          if (parent) {
            parent.children.push(node)
            parent.size += node.size
            parent.fileCount = (parent.fileCount || 0) + node.fileCount
          }
        }

        setImmediate(process)
      }
      process()
    }
    setImmediate(run)
  })
}

function cancelScan() {
  scanCancelled = true
}

/**
 * Scanne un dossier (synchrone, pour compat).
 */
function scanFolder(folderPath, maxDepth = 8, currentDepth = 0) {
  const name = path.basename(folderPath) || folderPath
  const result = {
    name: name || '(racine)',
    path: folderPath,
    size: 0,
    children: [],
  }

  if (currentDepth >= maxDepth) return result

  let size = 0
  let entries = []
  try {
    entries = fs.readdirSync(folderPath, { withFileTypes: true })
  } catch {
    return result
  }

  const dirs = []
  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name)
    try {
      if (entry.isDirectory()) {
        if (!['.', '..'].includes(entry.name)) dirs.push({ name: entry.name, path: fullPath })
      } else if (entry.isFile()) {
        size += fs.statSync(fullPath).size
      }
    } catch (_) {}
  }

  const dirsWithSize = []
  for (const d of dirs) {
    const child = scanFolder(d.path, maxDepth, currentDepth + 1)
    dirsWithSize.push(child)
    size += child.size
  }

  result.size = size
  result.children = dirsWithSize.sort((a, b) => (b.size || 0) - (a.size || 0)).slice(0, 50)
  return result
}

/**
 * Chemins des dossiers temporaires et cache (Windows).
 */
const CLEAN_PATHS = {
  temp: [
    process.env.TEMP || path.join(os.tmpdir(), 'temp'),
    process.env.TMP || path.join(os.tmpdir(), 'tmp'),
    path.join(process.env.LOCALAPPDATA || '', 'Temp'),
  ],
  browser_cache: [
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data', 'Default', 'Cache'),
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Edge', 'User Data', 'Default', 'Cache'),
    path.join(process.env.APPDATA || '', 'Mozilla', 'Firefox', 'Profiles'),
  ],
  recycle: process.platform === 'win32' ? ['C:\\$Recycle.Bin'] : [],
  logs: [path.join(process.env.LOCALAPPDATA || '', '*.log')],
}

function analyzeCleanable() {
  const categories = []
  let totalSize = 0

  const getDirSize = (dir) => {
    let size = 0
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const e of entries) {
        const full = path.join(dir, e.name)
        try {
          if (e.isDirectory()) size += getDirSize(full)
          else size += fs.statSync(full).size
        } catch (_) {}
      }
    } catch (_) {}
    return size
  }

  let tempSize = 0
  for (const p of CLEAN_PATHS.temp.filter(Boolean)) {
    if (fs.existsSync(p)) tempSize += getDirSize(p)
  }
  categories.push({ id: 'temp', label: 'Fichiers temporaires', size: tempSize })
  totalSize += tempSize

  let cacheSize = 0
  for (const p of CLEAN_PATHS.browser_cache) {
    if (p && fs.existsSync(p)) cacheSize += getDirSize(p)
  }
  categories.push({ id: 'browser_cache', label: 'Cache navigateurs', size: cacheSize })
  totalSize += cacheSize

  categories.push({ id: 'recycle', label: 'Corbeille', size: 0 })
  categories.push({ id: 'downloads', label: 'Téléchargements récents', size: 0 })
  categories.push({ id: 'logs', label: 'Fichiers journaux', size: 0 })

  return { categories, totalSize }
}

function cleanFiles(categoryIds) {
  let cleanedSize = 0

  const deleteDir = (dir) => {
    let size = 0
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const e of entries) {
        const full = path.join(dir, e.name)
        try {
          if (e.isDirectory()) size += deleteDir(full)
          else {
            size += fs.statSync(full).size
            fs.unlinkSync(full)
          }
        } catch (_) {}
      }
      fs.rmdirSync(dir)
    } catch (_) {}
    return size
  }

  if (categoryIds.includes('temp')) {
    for (const p of CLEAN_PATHS.temp) {
      if (p && fs.existsSync(p)) {
        try {
          const entries = fs.readdirSync(p)
          for (const name of entries) {
            const full = path.join(p, name)
            try {
              if (fs.statSync(full).isDirectory()) cleanedSize += deleteDir(full)
              else {
                cleanedSize += fs.statSync(full).size
                fs.unlinkSync(full)
              }
            } catch (_) {}
          }
        } catch (_) {}
      }
    }
  }

  return { cleanedSize }
}

module.exports = {
  getDrives,
  scanFolder,
  scanFolderAsync,
  cancelScan,
  analyzeCleanable,
  cleanFiles,
}
