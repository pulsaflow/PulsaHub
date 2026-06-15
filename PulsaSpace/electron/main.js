/**
 * PulsaSpace — Point d'entrée Electron
 * Fenêtre principale, IPC pour disque et nettoyage.
 */

const { app, BrowserWindow, ipcMain, dialog, shell, clipboard } = require('electron')
const path = require('path')
const fs = require('fs')
const diskHandler = require('./disk-handler')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d0d12',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
  if (isDev) {
    mainWindow.loadURL('http://localhost:5174')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC: Liste des disques
ipcMain.handle('get-drives', async () => {
  try {
    const drives = diskHandler.getDrives()
    return { success: true, drives }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

const CACHE_MAX_AGE_MS = 30 * 60 * 1000

function getScanCachePath() {
  return path.join(app.getPath('userData'), 'scan-cache.json')
}

function loadScanCache(folderPath) {
  try {
    const cachePath = getScanCachePath()
    if (!fs.existsSync(cachePath)) return null
    const raw = fs.readFileSync(cachePath, 'utf-8')
    const data = JSON.parse(raw)
    const entry = data[path.normalize(folderPath)]
    if (!entry || !entry.tree) return null
    if (Date.now() - (entry.timestamp || 0) > CACHE_MAX_AGE_MS) return null
    return entry
  } catch {
    return null
  }
}

function saveScanCache(folderPath, tree, stats, topFiles) {
  try {
    const cachePath = getScanCachePath()
    let data = {}
    if (fs.existsSync(cachePath)) {
      data = JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
    }
    const key = path.normalize(folderPath)
    data[key] = { tree, stats, topFiles, timestamp: Date.now() }
    fs.writeFileSync(cachePath, JSON.stringify(data), 'utf-8')
  } catch (_) {}
}

// IPC: Scan d'un dossier (async avec progression, annulation)
ipcMain.handle('scan-folder', async (_, folderPath, options = {}) => {
  const win = mainWindow ?? BrowserWindow.getFocusedWindow()
  const onProgress = win ? (p) => win.webContents.send('scan-progress', p) : () => {}
  try {
    if (!folderPath || typeof folderPath !== 'string') {
      return { success: false, error: 'Chemin invalide' }
    }
    const normalized = path.normalize(folderPath)
    if (!fs.existsSync(normalized) || !fs.statSync(normalized).isDirectory()) {
      return { success: false, error: 'Dossier introuvable' }
    }
    if (options.useCache) {
      const cached = loadScanCache(normalized)
      if (cached) {
        return {
          success: true,
          tree: cached.tree,
          stats: cached.stats || {},
          topFiles: cached.topFiles || [],
          fromCache: true,
        }
      }
    }
    const result = await diskHandler.scanFolderAsync(normalized, {
      maxDepth: options.maxDepth ?? 8,
      skipSystem: options.skipSystem !== false,
      skipJunctions: options.skipJunctions !== false,
      onProgress,
    })
    if (result.cancelled) {
      return { success: false, error: 'Scan annulé' }
    }
    const stats = {
      fileCount: result.fileCount,
      folderCount: result.folderCount,
      duration: result.duration,
      inaccessibleCount: result.inaccessiblePaths?.length || 0,
    }
    saveScanCache(normalized, result.tree, stats, result.topFiles || [])
    return {
      success: true,
      tree: result.tree,
      stats,
      topFiles: result.topFiles || [],
      inaccessiblePaths: result.inaccessiblePaths,
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// IPC: Annuler le scan
ipcMain.handle('cancel-scan', () => {
  diskHandler.cancelScan()
  return { success: true }
})

// IPC: Copier le chemin dans le presse-papiers
ipcMain.handle('copy-path', async (_, paths) => {
  try {
    const list = Array.isArray(paths) ? paths : (paths ? [paths] : [])
    if (list.length === 0) return { success: false }
    const text = list.join('\n')
    clipboard.writeText(text)
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// IPC: Supprimer vers la corbeille
ipcMain.handle('trash-path', async (_, paths) => {
  try {
    const list = Array.isArray(paths) ? paths : (paths ? [paths] : [])
    if (list.length === 0) return { success: false }
    for (const p of list) {
      const normalized = path.normalize(p)
      if (fs.existsSync(normalized)) {
        await shell.trashItem(normalized)
      }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// IPC: Propriétés Windows (boîte de dialogue)
ipcMain.handle('show-properties', async (_, itemPath) => {
  try {
    if (!itemPath || typeof itemPath !== 'string') return { success: false }
    const normalized = path.normalize(itemPath)
    if (!fs.existsSync(normalized)) return { success: false }
    const { exec } = require('child_process')
    const scriptPath = path.join(app.getPath('temp'), 'pulsaspace-props.ps1')
    const escaped = normalized.replace(/'/g, "''")
    const script = `$p = Get-Item -LiteralPath '${escaped}' -EA SilentlyContinue
if ($p) { Invoke-Item -LiteralPath $p.FullName -Verb properties }`
    fs.writeFileSync(scriptPath, script, 'utf8')
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`, (err) => {
      if (err) console.error('show-properties:', err)
    })
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// IPC: Ouvrir un dossier dans l'Explorateur Windows
ipcMain.handle('open-in-explorer', async (_, folderPath) => {
  try {
    if (!folderPath || typeof folderPath !== 'string') return { success: false }
    const normalized = path.normalize(folderPath)
    if (!fs.existsSync(normalized)) return { success: false }
    shell.openPath(normalized)
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// IPC: Ouvrir une boîte de dialogue dossier
ipcMain.handle('open-dialog', async (_, options) => {
  const win = mainWindow ?? BrowserWindow.getFocusedWindow()
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
    title: options?.title || 'Sélectionner un dossier',
    ...options,
  })
  return result
})

// IPC: Analyser les fichiers nettoyables
ipcMain.handle('analyze-cleanable', async () => {
  try {
    const { categories, totalSize } = diskHandler.analyzeCleanable()
    return { success: true, categories, totalSize }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// IPC: Nettoyer les fichiers
ipcMain.handle('clean-files', async (_, categoryIds) => {
  try {
    if (!Array.isArray(categoryIds)) {
      return { success: false, error: 'Catégories invalides' }
    }
    const { cleanedSize } = diskHandler.cleanFiles(categoryIds)
    return { success: true, cleanedSize }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// IPC: Fenêtre
ipcMain.on('window-close', () => mainWindow?.close())
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
