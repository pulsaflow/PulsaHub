/**
 * PulsaSpace — Vue Analyse disque (type WinDirStat)
 * Tree map et liste des dossiers par taille.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { FolderOpen, RefreshCw, ChevronRight, ChevronDown, FolderInput, X, ExternalLink, Copy, Search, Trash2, FileText, BarChart3 } from 'lucide-react'
import { formatSize, formatDate } from '../utils/formatSize'
import TreeMap from './TreeMap'
import { toast } from '../utils/toast'
import './DiskAnalysis.css'

export default function DiskAnalysis() {
  const [drives, setDrives] = useState([])
  const [selectedDrive, setSelectedDrive] = useState(null)
  const [customPath, setCustomPath] = useState(null)
  const [treeData, setTreeData] = useState(null)
  const [topFiles, setTopFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(null)
  const [stats, setStats] = useState(null)
  const [maxDepth, setMaxDepth] = useState(8)
  const [treeSortBy, setTreeSortBy] = useState('size')
  const [treeSortDir, setTreeSortDir] = useState('desc')
  const [selectedPaths, setSelectedPaths] = useState(() => new Set())
  const [lastSelectedPath, setLastSelectedPath] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [minSizeMb, setMinSizeMb] = useState(0)
  const [emptyOnly, setEmptyOnly] = useState(false)
  const [viewMode, setViewMode] = useState('tree')
  const [listPanelWidth, setListPanelWidth] = useState(60)
  const [treeMapSize, setTreeMapSize] = useState({ width: 0, height: 0 })
  const splitterRef = useRef(null)
  const treeContainerRef = useRef(null)
  const treeMapContainerRef = useRef(null)

  const isElectron = typeof window !== 'undefined' && window.pulsaspace

  const openInExplorer = useCallback(async (folderPath) => {
    if (!isElectron || !folderPath) return
    try {
      await window.pulsaspace.invoke('open-in-explorer', folderPath)
    } catch (err) {
      toast.error('Erreur lors de l’ouverture : ' + err.message)
    }
  }, [isElectron])

  const refreshCurrent = useCallback(() => {
    const pathToScan = customPath || (selectedDrive ? selectedDrive + '\\' : null)
    if (pathToScan) scanPath(pathToScan, true)
  }, [customPath, selectedDrive, scanPath])

  const trashPaths = useCallback(async (paths) => {
    if (!isElectron) return
    const list = Array.isArray(paths) ? paths : (paths ? [paths] : [])
    if (list.length === 0) return
    // On conserve le confirm OS
    if (!window.confirm(`Envoyer ${list.length} élément(s) à la corbeille ?`)) return
    try {
      const result = await window.pulsaspace.invoke('trash-path', list)
      if (!result?.success) throw new Error(result?.error || 'Erreur inconnue')
      toast.success(`${list.length} élément(s) supprimé(s).`)
      setSelectedPaths(new Set())
      setLastSelectedPath(null)
      refreshCurrent()
    } catch (err) {
      toast.error('Erreur de suppression : ' + err.message)
    }
  }, [isElectron, refreshCurrent])

  const showProperties = useCallback(async (itemPath) => {
    if (!isElectron || !itemPath) return
    try {
      await window.pulsaspace.invoke('show-properties', itemPath)
    } catch (err) {
      toast.error('Impossible d’ouvrir les propriétés : ' + err.message)
    }
  }, [isElectron])

  const copyPathToClipboard = useCallback(async (paths) => {
    if (!isElectron) return
    const list = Array.isArray(paths) ? paths : (paths ? [paths] : [])
    if (list.length === 0) return
    try {
      await window.pulsaspace.invoke('copy-path', list)
      toast.success(list.length > 1 ? `${list.length} chemins copiés !` : 'Chemin copié !')
    } catch (err) {
      toast.error('Erreur lors de la copie : ' + err.message)
    }
  }, [isElectron])

  const setTreeSort = useCallback((col) => {
    setTreeSortBy((prev) => {
      const same = col === prev
      setTreeSortDir((d) => (same ? (d === 'asc' ? 'desc' : 'asc') : 'desc'))
      return col
    })
  }, [])

  const loadDrives = useCallback(async () => {
    if (!isElectron) {
      setDrives([
        { letter: 'C:', label: 'Disque local (C:)', total: 0, free: 0, used: 0, typeLabel: 'Local', fileSystem: 'NTFS' },
        { letter: 'D:', label: 'Disque local (D:)', total: 0, free: 0, used: 0, typeLabel: 'Local', fileSystem: 'NTFS' },
      ])
      setSelectedDrive((prev) => prev || 'C:')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const result = await window.pulsaspace.invoke('get-drives')
      if (result.success) {
        setDrives(result.drives || [])
        if (result.drives?.length > 0 && !selectedDrive && !customPath) {
          setSelectedDrive(result.drives[0].letter)
        }
      } else {
        setError(result.error || 'Erreur chargement disques')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isElectron])

  const scanPath = useCallback(
    async (pathToScan, forceRefresh = false) => {
      if (!isElectron) {
        setTreeData({
          name: pathToScan,
          path: pathToScan,
          size: 0,
          children: [
            { name: 'Program Files', path: pathToScan + '\\Program Files', size: 0, children: [] },
            { name: 'Users', path: pathToScan + '\\Users', size: 0, children: [] },
          ],
        })
        setStats({ fileCount: 0, folderCount: 2, duration: 0 })
        return
      }
      try {
        setScanning(true)
        setError(null)
        setTreeData(null)
        setTopFiles([])
        setStats(null)
        setProgress({ folderCount: 0, fileCount: 0 })

        const progressHandler = (p) => setProgress(p)
        window.pulsaspace.on('scan-progress', progressHandler)

        const result = await window.pulsaspace.invoke('scan-folder', pathToScan, {
          maxDepth,
          useCache: !forceRefresh,
          skipSystem: true,
          skipJunctions: true,
        })
        window.pulsaspace.removeListener('scan-progress')

        if (result.success) {
          setTreeData(result.tree)
          setStats(result.stats || {})
          setTopFiles(result.topFiles || [])
          setSelectedPaths(new Set())
          setLastSelectedPath(null)
          if (!forceRefresh) toast.success(`Analyse terminée en ${result.stats?.duration || 0}s`)
        } else {
          toast.error(result.error || 'Erreur scan')
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        setScanning(false)
        setProgress(null)
      }
    },
    [isElectron, maxDepth]
  )

  const cancelScan = useCallback(async () => {
    if (isElectron) {
      await window.pulsaspace.invoke('cancel-scan')
    }
  }, [isElectron])

  const browseFolder = useCallback(async () => {
    if (!isElectron) return
    try {
      const result = await window.pulsaspace.invoke('open-dialog', {
        title: 'Sélectionner un dossier à analyser',
      })
      if (!result.canceled && result.filePaths?.[0]) {
        setCustomPath(result.filePaths[0])
        setSelectedDrive(null)
      }
    } catch (err) {
      setError(err.message)
    }
  }, [isElectron])

  useEffect(() => {
    loadDrives()
  }, [loadDrives])

  useEffect(() => {
    if (!isElectron) return
    const interval = setInterval(loadDrives, 60000)
    return () => clearInterval(interval)
  }, [isElectron, loadDrives])

  useEffect(() => {
    if (selectedDrive && !customPath) {
      scanPath(selectedDrive + '\\')
    }
  }, [selectedDrive, maxDepth, customPath, scanPath])

  useEffect(() => {
    if (customPath) {
      scanPath(customPath)
    }
  }, [customPath, maxDepth, scanPath])

  useEffect(() => {
    if (treeData && !scanning && treeContainerRef.current) {
      treeContainerRef.current.focus()
    }
  }, [treeData, scanning])

  const currentLabel = customPath || selectedDrive

  const handleTreeSelect = useCallback((node, e, displayedItems) => {
    const path = node?.path
    if (!path) return
    const items = displayedItems ?? flattenTree(treeData)
    if (e?.ctrlKey || e?.metaKey) {
      setSelectedPaths((prev) => {
        const next = new Set(prev)
        if (next.has(path)) next.delete(path)
        else next.add(path)
        return next
      })
      setLastSelectedPath(path)
    } else if (e?.shiftKey) {
      const lastIdx = items.findIndex((n) => n.path === lastSelectedPath)
      const clickIdx = items.findIndex((n) => n.path === path)
      if (lastIdx >= 0 && clickIdx >= 0) {
        const [lo, hi] = [Math.min(lastIdx, clickIdx), Math.max(lastIdx, clickIdx)]
        const range = items.slice(lo, hi + 1).map((n) => n.path)
        setSelectedPaths(new Set(range))
      } else {
        setSelectedPaths(new Set([path]))
        setLastSelectedPath(path)
      }
    } else {
      setSelectedPaths(new Set([path]))
      setLastSelectedPath(path)
    }
  }, [treeData, lastSelectedPath])

  const handleTreeKeyDown = useCallback((e, root) => {
    if (!root || !treeContainerRef.current) return
    const items = flattenTree(root)
    const primary = selectedPaths.size > 0 ? Array.from(selectedPaths)[0] : lastSelectedPath
    const idx = items.findIndex((n) => n.path === primary)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIdx = idx < items.length - 1 ? idx + 1 : (idx === -1 ? 0 : idx)
      const nextPath = items[nextIdx]?.path
      if (nextPath) {
        setSelectedPaths(new Set([nextPath]))
        setLastSelectedPath(nextPath)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIdx = idx > 0 ? idx - 1 : (idx === -1 ? items.length - 1 : idx)
      const prevPath = items[prevIdx]?.path
      if (prevPath) {
        setSelectedPaths(new Set([prevPath]))
        setLastSelectedPath(prevPath)
      }
    } else if (e.key === 'Enter' && (primary || lastSelectedPath) && isElectron) {
      e.preventDefault()
      openInExplorer(primary || lastSelectedPath)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      const target = primary || lastSelectedPath
      const sep = target?.includes('\\') ? '\\' : '/'
      const parts = target?.split(/[/\\]/).filter(Boolean)
      if (parts && parts.length > 1) {
        const parentPath = parts.slice(0, -1).join(sep)
        setSelectedPaths(new Set([parentPath]))
        setLastSelectedPath(parentPath)
      }
    }
  }, [selectedPaths, lastSelectedPath, isElectron, openInExplorer])

  const handleSplitterMouseDown = useCallback((e) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = listPanelWidth
    const onMove = (ev) => {
      const delta = ev.clientX - startX
      const container = splitterRef.current?.parentElement
      const total = container?.offsetWidth || 1
      const newPct = Math.min(90, Math.max(20, (startW / 100) * total + delta) / total * 100)
      setListPanelWidth(newPct)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [listPanelWidth])

  useEffect(() => {
    if (!treeMapContainerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setTreeMapSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })
    resizeObserver.observe(treeMapContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div className="disk-analysis">
      <div className="disk-analysis-header">
        <h2 className="disk-analysis-title">Analyse de l&apos;espace disque</h2>
        <p className="disk-analysis-subtitle">
          Visualisez l&apos;occupation de vos disques et identifiez les plus gros dossiers
        </p>
      </div>

      <div className="disk-analysis-drives">
        <h3 className="disk-section-title">Disques</h3>
        <div className="drives-grid">
          {drives.map((d) => (
            <button
              key={d.letter}
              type="button"
              className={`drive-card ${selectedDrive === d.letter && !customPath ? 'drive-card--active' : ''} ${(d.used ?? (d.total - d.free)) / (d.total || 1) >= 0.9 ? 'drive-card--warning' : ''}`}
              onClick={() => {
                setSelectedDrive(d.letter)
                setCustomPath(null)
              }}
            >
              {(d.used ?? (d.total - d.free)) / (d.total || 1) >= 0.9 && (
                <span className="drive-card-alert" title="Disque presque plein">!</span>
              )}
              <FolderOpen size={24} className="drive-card-icon" />
              <span className="drive-card-letter">{d.letter}</span>
              <span className="drive-card-label">{d.label}</span>
              {(d.typeLabel || d.fileSystem) && (
                <span className="drive-card-meta">
                  {[d.typeLabel, d.fileSystem].filter(Boolean).join(' · ')}
                </span>
              )}
              <div className="drive-card-progress">
                <div
                  className="drive-card-progress-fill"
                  style={{
                    width: `${d.total > 0 ? Math.round(((d.used ?? d.total - d.free) / d.total) * 100) : 0}%`,
                  }}
                />
              </div>
              <span className="drive-card-size">
                {formatSize(d.used ?? (d.total - d.free))} utilisés / {formatSize(d.total)} total
              </span>
            </button>
          ))}
        </div>
        <div className="disk-actions-row">
          <button
            type="button"
            className="pulsa-btn-secondary"
            onClick={loadDrives}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Actualiser
          </button>
          {isElectron && (
            <button type="button" className="pulsa-btn-secondary" onClick={browseFolder}>
              <FolderInput size={16} />
              Parcourir un dossier…
            </button>
          )}
          <label className="disk-depth-label">
            Profondeur :
            <select
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              disabled={scanning}
              className="disk-depth-select"
            >
              {[4, 6, 8, 12, 16].map((d) => (
                <option key={d} value={d}>{d} niveaux</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {currentLabel && (
        <div className="disk-analysis-tree">
          <div className="disk-splitter-layout" ref={splitterRef}>
            <div className="disk-panel disk-panel-list" style={{ flex: `0 0 ${listPanelWidth}%` }}>
          <div className="disk-tree-header">
            <h3 className="disk-section-title">
              Arborescence — {customPath ? (customPath.split(/[/\\]/).filter(Boolean).pop() || customPath) : currentLabel}
              {scanning && <span className="disk-scanning"> (scan en cours…)</span>}
            </h3>
            {customPath && (
              <button
                type="button"
                className="pulsa-btn-secondary disk-clear-custom"
                onClick={() => {
                  setCustomPath(null)
                  setSelectedDrive(drives[0]?.letter || 'C:')
                }}
                title="Revenir aux disques"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {scanning && (
            <div className="disk-progress-bar">
              <div className="disk-progress-fill" />
              <span className="disk-progress-text">
                {progress?.folderCount ?? 0} dossiers · {progress?.fileCount ?? 0} fichiers
              </span>
              <button
                type="button"
                className="pulsa-btn-secondary disk-cancel-btn"
                onClick={cancelScan}
              >
                Annuler
              </button>
            </div>
          )}
          {error && <p className="disk-error">{error}</p>}
          {treeData && !scanning && (
            <div className="disk-search-row">
              <div className="disk-view-toggle">
                <button
                  type="button"
                  className={`disk-view-btn ${viewMode === 'tree' ? 'disk-view-btn--active' : ''}`}
                  onClick={() => setViewMode('tree')}
                  title="Vue arborescence"
                >
                  <FolderOpen size={14} />
                  Arborescence
                </button>
                <button
                  type="button"
                  className={`disk-view-btn ${viewMode === 'top50' ? 'disk-view-btn--active' : ''}`}
                  onClick={() => setViewMode('top50')}
                  title="Top 50 plus gros dossiers"
                >
                  <BarChart3 size={14} />
                  Top 50 Dossiers
                </button>
                <button
                  type="button"
                  className={`disk-view-btn ${viewMode === 'top100f' ? 'disk-view-btn--active' : ''}`}
                  onClick={() => setViewMode('top100f')}
                  title="Top 100 plus gros fichiers"
                >
                  <FileText size={14} />
                  Top 100 Fichiers
                </button>
              </div>
              <div className="disk-search-wrap">
                <Search size={16} className="disk-search-icon" />
                <input
                  type="text"
                  className="disk-search-input"
                  placeholder="Rechercher un dossier…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Rechercher par nom"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="disk-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Effacer la recherche"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {searchQuery && (
                <span className="disk-search-hint">
                  {filterTree(treeData, searchQuery)
                    ? `${flattenTree(filterTree(treeData, searchQuery)).length} résultat(s)`
                    : 'Aucun résultat'}
                </span>
              )}
              <label className="disk-filter-size">
                Taille min :
                <input
                  type="number"
                  min={0}
                  step={10}
                  placeholder="Mo"
                  value={minSizeMb || ''}
                  onChange={(e) => setMinSizeMb(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="disk-filter-input"
                />
                <span className="disk-filter-unit">Mo</span>
              </label>
              <label className="disk-filter-empty">
                <input
                  type="checkbox"
                  checked={emptyOnly}
                  onChange={(e) => setEmptyOnly(e.target.checked)}
                />
                Dossiers vides
              </label>
            </div>
          )}
          {stats && !scanning && (
            <div className="disk-stats">
              <span>
                {stats.fileCount?.toLocaleString()} fichiers · {stats.folderCount?.toLocaleString()} dossiers
                {stats.duration != null && ` · ${stats.duration} s`}
                {stats.inaccessibleCount > 0 && (
                  <span className="disk-stats-warning"> · {stats.inaccessibleCount} inaccessibles</span>
                )}
              </span>
              <button
                type="button"
                className="pulsa-btn-secondary disk-refresh-scan"
                onClick={refreshCurrent}
                title="Actualiser (ignorer le cache)"
              >
                <RefreshCw size={14} />
                Actualiser
              </button>
            </div>
          )}
          {treeData && !scanning && (() => {
            let baseTree = filterTree(treeData, searchQuery)
            if (baseTree && minSizeMb > 0) {
              baseTree = filterTreeBySize(baseTree, minSizeMb * 1024 * 1024)
            }
            if (baseTree && emptyOnly) {
              baseTree = filterTreeByEmpty(baseTree)
            }
            if (viewMode === 'top50') {
              const all = flattenTree(baseTree || treeData).filter((n) => n.path && n !== treeData)
              const top50 = emptyOnly
                ? [...all].filter((n) => (n.fileCount ?? 0) === 0).sort((a, b) => (b.size || 0) - (a.size || 0)).slice(0, 50)
                : [...all].sort((a, b) => (b.size || 0) - (a.size || 0)).slice(0, 50)
              const totalSize = treeData?.size || 1
              return (
                <div
                  ref={treeContainerRef}
                  className="tree-container"
                  tabIndex={0}
                  onKeyDown={(e) => handleTreeKeyDown(e, { children: top50, path: '__root__' })}
                >
                  <div className="tree-view">
                    <div className="tree-header">
                      <span className="tree-chevron-placeholder" />
                      <span className="tree-header-rank">#</span>
                      <span className="tree-header-name">Nom</span>
                      <span className="tree-header-size">Taille</span>
                      <span className="tree-header-files">Fichiers</span>
                      <span className="tree-header-pct">%</span>
                      <span className="tree-header-date">Modifié</span>
                    </div>
                    {top50.map((node, i) => {
                      const percent = totalSize > 0 ? (100 * (node.size || 0)) / totalSize : 0
                      const isSelected = selectedPaths?.has(node.path)
                      return (
                        <div
                          key={node.path || i}
                          className={`tree-item ${isSelected ? 'tree-item--selected' : ''}`}
                          style={{ paddingLeft: 8 }}
                          title={`${node.name || ''}\n${formatSize(node.size || 0)}\n${node.path || ''}`}
                          onClick={(e) => handleTreeSelect(node, e, top50)}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!selectedPaths.has(node.path)) {
                              setSelectedPaths(new Set([node.path]))
                              setLastSelectedPath(node.path)
                            }
                            setContextMenu({ x: e.clientX, y: e.clientY, node })
                          }}
                          onDoubleClick={() => node.path && openInExplorer(node.path)}
                        >
                          <span className="tree-chevron-placeholder" />
                          <span className="tree-rank">{i + 1}</span>
                          <span className={`tree-name ${node.inaccessible ? 'tree-name--inaccessible' : ''}`}>
                            {node.name || '(racine)'}
                            {node.inaccessible && ' (inaccessible)'}
                          </span>
                          <span className="tree-size">{formatSize(node.size || 0)}</span>
                          <span className="tree-files">{node.fileCount != null ? node.fileCount.toLocaleString() : '—'}</span>
                          <span className="tree-pct">{percent.toFixed(1)}%</span>
                          <span className="tree-date">{formatDate(node.mtime)}</span>
                        </div>
                      )
                    })}
                  </div>
                  {contextMenu && (
                    <>
                      <div className="context-menu-overlay" onClick={() => setContextMenu(null)} />
                      <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
                        <button type="button" onClick={() => { openInExplorer(contextMenu.node.path); setContextMenu(null) }}>
                          <ExternalLink size={14} /> Ouvrir dans l&apos;Explorateur
                        </button>
                        <button type="button" onClick={() => { copyPathToClipboard(selectedPaths.size > 0 ? Array.from(selectedPaths) : [contextMenu.node.path]); setContextMenu(null) }}>
                          <Copy size={14} /> Copier le chemin
                        </button>
                        <button type="button" onClick={() => { trashPaths(selectedPaths.size > 0 ? Array.from(selectedPaths) : [contextMenu.node.path]); setContextMenu(null) }}>
                          <Trash2 size={14} /> Supprimer (corbeille)
                        </button>
                        <button type="button" onClick={() => { showProperties(contextMenu.node.path); setContextMenu(null) }}>
                          <FileText size={14} /> Propriétés
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            }
            if (viewMode === 'top100f') {
              const maxSizeBytes = topFiles.length > 0 ? topFiles[0].size : 1
              return (
                <div
                  ref={treeContainerRef}
                  className="tree-container"
                  tabIndex={0}
                  onKeyDown={(e) => handleTreeKeyDown(e, { children: topFiles, path: '__root__' })}
                >
                  <div className="tree-view">
                    <div className="tree-header">
                      <span className="tree-header-rank">#</span>
                      <span className="tree-header-name">Nom du Fichier</span>
                      <span className="tree-header-size">Taille</span>
                      <span className="tree-header-pct">% (Max)</span>
                      <span className="tree-header-date">Modifié</span>
                    </div>
                    {topFiles.map((file, i) => {
                      const percent = maxSizeBytes > 0 ? (100 * (file.size || 0)) / maxSizeBytes : 0
                      const isSelected = selectedPaths?.has(file.path)
                      return (
                        <div
                          key={file.path || i}
                          className={`tree-item ${isSelected ? 'tree-item--selected' : ''}`}
                          style={{ paddingLeft: 8 }}
                          title={`${file.name || ''}\n${formatSize(file.size || 0)}\n${file.path || ''}`}
                          onClick={(e) => handleTreeSelect(file, e, topFiles)}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!selectedPaths.has(file.path)) {
                              setSelectedPaths(new Set([file.path]))
                              setLastSelectedPath(file.path)
                            }
                            setContextMenu({ x: e.clientX, y: e.clientY, node: file })
                          }}
                          onDoubleClick={() => file.path && showProperties(file.path)}
                        >
                          <span className="tree-rank">{i + 1}</span>
                          <span className="tree-name">{file.name || 'Inconnu'}</span>
                          <span className="tree-size">{formatSize(file.size || 0)}</span>
                          <span className="tree-pct">{percent.toFixed(1)}%</span>
                          <span className="tree-date">{formatDate(file.mtime)}</span>
                        </div>
                      )
                    })}
                  </div>
                  {contextMenu && (
                    <>
                      <div className="context-menu-overlay" onClick={() => setContextMenu(null)} />
                      <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
                        <button type="button" onClick={() => { openInExplorer(contextMenu.node.path); setContextMenu(null) }}>
                          <ExternalLink size={14} /> Ouvrir l'emplacement
                        </button>
                        <button type="button" onClick={() => { copyPathToClipboard(selectedPaths.size > 0 ? Array.from(selectedPaths) : [contextMenu.node.path]); setContextMenu(null) }}>
                          <Copy size={14} /> Copier le chemin
                        </button>
                        <button type="button" onClick={() => { trashPaths(selectedPaths.size > 0 ? Array.from(selectedPaths) : [contextMenu.node.path]); setContextMenu(null) }}>
                          <Trash2 size={14} /> Supprimer (corbeille)
                        </button>
                        <button type="button" onClick={() => { showProperties(contextMenu.node.path); setContextMenu(null) }}>
                          <FileText size={14} /> Propriétés
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )
            }
            const displayTree = baseTree
            const items = displayTree ? flattenTree(displayTree) : []
            if (!displayTree) {
              return (
                <div className="tree-container tree-container--empty" tabIndex={0}>
                  <p className="disk-search-empty">
                    {searchQuery ? `Aucun dossier ne correspond à "${searchQuery}"` : 'Aucun résultat'}
                    {(minSizeMb > 0 || emptyOnly) && ' avec les filtres appliqués'}
                  </p>
                </div>
              )
            }
            return (
            <div
              ref={treeContainerRef}
              className="tree-container"
              tabIndex={0}
              onKeyDown={(e) => handleTreeKeyDown(e, displayTree)}
            >
              <TreeView
                node={displayTree}
                level={0}
                parentSize={treeData?.size}
                sortBy={treeSortBy}
                sortDir={treeSortDir}
                onSortChange={setTreeSort}
                selectedPaths={selectedPaths}
                flattenedItems={items}
                onSelect={(node, e) => handleTreeSelect(node, e, items)}
                onContextMenu={(e, node) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!selectedPaths.has(node.path)) {
                    setSelectedPaths(new Set([node.path]))
                    setLastSelectedPath(node.path)
                  }
                  setContextMenu({ x: e.clientX, y: e.clientY, node })
                }}
                onOpenInExplorer={openInExplorer}
              />
              {contextMenu && (
                <>
                  <div
                    className="context-menu-overlay"
                    onClick={() => setContextMenu(null)}
                  />
                  <div
                    className="context-menu"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        openInExplorer(contextMenu.node.path)
                        setContextMenu(null)
                      }}
                    >
                      <ExternalLink size={14} />
                      Ouvrir dans l&apos;Explorateur
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const paths = selectedPaths.size > 0
                          ? Array.from(selectedPaths)
                          : [contextMenu.node.path]
                        copyPathToClipboard(paths)
                        setContextMenu(null)
                      }}
                    >
                      <Copy size={14} />
                      Copier le chemin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const paths = selectedPaths.size > 0
                          ? Array.from(selectedPaths)
                          : [contextMenu.node.path]
                        trashPaths(paths)
                        setContextMenu(null)
                      }}
                    >
                      <Trash2 size={14} />
                      Supprimer (corbeille)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        showProperties(contextMenu.node.path)
                        setContextMenu(null)
                      }}
                    >
                      <FileText size={14} />
                      Propriétés
                    </button>
                  </div>
                </>
              )}
            </div>
            )
          })()}
            </div>
            <div
              className="disk-splitter"
              onMouseDown={handleSplitterMouseDown}
              role="separator"
              aria-orientation="vertical"
              aria-valuenow={listPanelWidth}
              title="Redimensionner"
            />
            <div 
              ref={treeMapContainerRef}
              className="disk-panel disk-panel-treemap" 
              style={{ flex: `1 1 ${100 - listPanelWidth}%`, position: 'relative' }}
            >
              <TreeMap 
                data={treeData} 
                width={treeMapSize.width} 
                height={treeMapSize.height}
                onSelect={(node) => {
                  if (node && node.path) {
                    setSelectedPaths(new Set([node.path]))
                    setLastSelectedPath(node.path)
                  }
                }}
                selectedPaths={selectedPaths}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function flattenTree(node, out = []) {
  if (!node) return out
  out.push(node)
  ;(node.children || []).forEach((c) => flattenTree(c, out))
  return out
}

/** Filtre l'arbre par nom (conserve les ancêtres des nœuds correspondants). */
function filterTree(node, query) {
  if (!node) return null
  if (!query?.trim()) return node
  const q = query.trim().toLowerCase()
  const matches = (node.name || '').toLowerCase().includes(q)
  const filteredChildren = (node.children || [])
    .map((c) => filterTree(c, query))
    .filter(Boolean)
  if (matches || filteredChildren.length > 0) {
    return { ...node, children: filteredChildren }
  }
  return null
}

/** Filtre par taille minimale (octets). */
function filterTreeBySize(node, minBytes) {
  if (!node || minBytes <= 0) return node
  const size = node.size || 0
  const filteredChildren = (node.children || [])
    .map((c) => filterTreeBySize(c, minBytes))
    .filter(Boolean)
  if (size >= minBytes || filteredChildren.length > 0) {
    return { ...node, children: filteredChildren }
  }
  return null
}

/** Filtre pour n'afficher que les dossiers vides (fileCount === 0). */
function filterTreeByEmpty(node) {
  if (!node) return null
  const empty = (node.fileCount ?? 0) === 0
  const filteredChildren = (node.children || [])
    .map(filterTreeByEmpty)
    .filter(Boolean)
  if (empty || filteredChildren.length > 0) {
    return { ...node, children: filteredChildren }
  }
  return null
}

const SORT_COLS = {
  name: (a, b) => (a.name || '').localeCompare(b.name || ''),
  size: (a, b) => (a.size || 0) - (b.size || 0),
  fileCount: (a, b) => (a.fileCount || 0) - (b.fileCount || 0),
  mtime: (a, b) => (a.mtime || 0) - (b.mtime || 0),
}

function sortChildren(children, sortBy, sortDir) {
  if (!children?.length) return children
  const cmp = SORT_COLS[sortBy] || SORT_COLS.size
  return [...children].sort((a, b) => {
    const v = cmp(a, b)
    return sortDir === 'asc' ? v : -v
  })
}

function TreeView({ node, level, parentSize, sortBy, sortDir, onSortChange, selectedPaths, flattenedItems, onSelect, onContextMenu, onOpenInExplorer, isBig }) {
  const [expanded, setExpanded] = useState(level < 2)
  const hasChildren = node.children && node.children.length > 0
  const sortedChildren = sortChildren(node.children, sortBy, sortDir)
  const percent = parentSize > 0 ? (100 * (node.size || 0)) / parentSize : 0
  const isSelected = selectedPaths?.has(node.path)

  return (
    <div className="tree-view">
      {level === 0 && (
        <div className="tree-header">
          <span className="tree-header-name" onClick={() => onSortChange?.('name')}>Nom</span>
          <span className="tree-header-size" onClick={() => onSortChange?.('size')}>Taille</span>
          <span className="tree-header-files" onClick={() => onSortChange?.('fileCount')}>Fichiers</span>
          <span className="tree-header-pct" onClick={() => onSortChange?.('size')}>%</span>
          <span className="tree-header-date" onClick={() => onSortChange?.('mtime')}>Modifié</span>
        </div>
      )}
      <div
        className={`tree-item ${isSelected ? 'tree-item--selected' : ''} ${isBig ? 'tree-item--big' : ''}`}
        style={{ paddingLeft: level * 16 + 8 }}
        title={`${node.name || ''}\n${formatSize(node.size || 0)}\n${node.path || ''}`}
        onClick={(e) => {
          onSelect?.(node, e)
          if (hasChildren && !e.ctrlKey && !e.metaKey && !e.shiftKey) setExpanded(!expanded)
        }}
        onContextMenu={(e) => onContextMenu?.(e, node)}
        onDoubleClick={() => node.path && onOpenInExplorer?.(node.path)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown size={16} className="tree-chevron" />
          ) : (
            <ChevronRight size={16} className="tree-chevron" />
          )
        ) : (
          <span className="tree-chevron-placeholder" />
        )}
        <span className={`tree-name ${node.inaccessible ? 'tree-name--inaccessible' : ''}`}>
          {node.name || '(racine)'}
          {node.inaccessible && ' (inaccessible)'}
        </span>
        <span className="tree-size">{formatSize(node.size || 0)}</span>
        <span className="tree-files">{node.fileCount != null ? node.fileCount.toLocaleString() : '—'}</span>
        <span className="tree-pct">{parentSize > 0 ? `${percent.toFixed(1)}%` : '—'}</span>
        <span className="tree-date">{formatDate(node.mtime)}</span>
      </div>
      {expanded && hasChildren && (
        <div className="tree-children">
          {sortedChildren.map((child, i) => (
            <TreeView
              key={child.path || i}
              node={child}
              level={level + 1}
              parentSize={node.size || 1}
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={onSortChange}
                selectedPaths={selectedPaths}
                flattenedItems={flattenedItems}
                onSelect={onSelect}
                onContextMenu={onContextMenu}
                onOpenInExplorer={onOpenInExplorer}
              isBig={i < 5}
            />
          ))}
        </div>
      )}
    </div>
  )
}
