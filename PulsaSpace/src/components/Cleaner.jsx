/**
 * PulsaSpace — Vue Nettoyage (type CCleaner)
 * Fichiers temporaires, cache navigateur, etc.
 */

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Search, Loader2 } from 'lucide-react'
import { formatSize } from '../utils/formatSize'
import './Cleaner.css'

const CLEAN_CATEGORIES = [
  { id: 'temp', label: 'Fichiers temporaires Windows', desc: 'Temp, Prefetch, etc.' },
  { id: 'browser_cache', label: 'Cache navigateurs', desc: 'Chrome, Edge, Firefox' },
  { id: 'recycle', label: 'Corbeille', desc: 'Fichiers supprimés' },
  { id: 'downloads', label: 'Téléchargements récents', desc: 'Historique des téléchargements' },
  { id: 'logs', label: 'Fichiers journaux', desc: 'Logs système et applications' },
]

export default function Cleaner() {
  const [categories, setCategories] = useState(
    CLEAN_CATEGORIES.map((c) => ({ ...c, checked: true, size: 0 }))
  )
  const [totalSize, setTotalSize] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [lastCleaned, setLastCleaned] = useState(null)

  const isElectron = typeof window !== 'undefined' && window.pulsaspace

  const analyze = useCallback(async () => {
    if (!isElectron) {
      setCategories((prev) =>
        prev.map((c) => ({ ...c, size: Math.floor(Math.random() * 500) * 1024 * 1024 }))
      )
      setTotalSize(1234567890)
      return
    }
    try {
      setAnalyzing(true)
      const result = await window.pulsaspace.invoke('analyze-cleanable')
      if (result.success) {
        setCategories(
          (result.categories || []).map((c) => ({
            ...CLEAN_CATEGORIES.find((x) => x.id === c.id),
            ...c,
            checked: true,
          }))
        )
        setTotalSize(result.totalSize || 0)
      }
    } catch (err) {
      console.error('Analyze error:', err)
    } finally {
      setAnalyzing(false)
    }
  }, [isElectron])

  const clean = useCallback(async () => {
    const toClean = categories.filter((c) => c.checked).map((c) => c.id)
    if (toClean.length === 0) return
    if (!isElectron) {
      setCleaning(true)
      setTimeout(() => {
        setCleaning(false)
        setLastCleaned(formatSize(totalSize))
        setTotalSize(0)
        setCategories((prev) => prev.map((c) => ({ ...c, size: 0 })))
      }, 1500)
      return
    }
    try {
      setCleaning(true)
      const result = await window.pulsaspace.invoke('clean-files', toClean)
      if (result.success) {
        setLastCleaned(formatSize(result.cleanedSize || totalSize))
        setTotalSize(0)
        setCategories((prev) => prev.map((c) => ({ ...c, size: 0 })))
      }
    } catch (err) {
      console.error('Clean error:', err)
    } finally {
      setCleaning(false)
    }
  }, [categories, totalSize, isElectron])

  const toggleCategory = (id) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    )
  }

  useEffect(() => {
    analyze()
  }, [analyze])

  const checkedTotal = categories
    .filter((c) => c.checked)
    .reduce((sum, c) => sum + (c.size || 0), 0)

  return (
    <div className="cleaner">
      <div className="cleaner-header">
        <h2 className="cleaner-title">Nettoyage</h2>
        <p className="cleaner-subtitle">
          Libérez de l&apos;espace en supprimant les fichiers temporaires et le cache
        </p>
      </div>

      <div className="cleaner-actions">
        <button
          type="button"
          className="pulsa-btn-primary"
          onClick={analyze}
          disabled={analyzing}
        >
          {analyzing ? (
            <Loader2 size={18} className="spin" />
          ) : (
            <Search size={18} />
          )}
          {analyzing ? 'Analyse en cours…' : 'Analyser'}
        </button>
        <button
          type="button"
          className="pulsa-btn-secondary"
          onClick={clean}
          disabled={cleaning || checkedTotal === 0}
        >
          {cleaning ? (
            <Loader2 size={18} className="spin" />
          ) : (
            <Trash2 size={18} />
          )}
          {cleaning ? 'Nettoyage…' : `Nettoyer (${formatSize(checkedTotal)})`}
        </button>
      </div>

      {lastCleaned && (
        <div className="cleaner-success pulsa-badge pulsa-badge--success">
          {lastCleaned} libérés
        </div>
      )}

      <div className="cleaner-categories">
        {categories.map((c) => (
          <label key={c.id} className="cleaner-category">
            <input
              type="checkbox"
              checked={c.checked}
              onChange={() => toggleCategory(c.id)}
            />
            <div className="cleaner-category-content">
              <span className="cleaner-category-label">{c.label}</span>
              <span className="cleaner-category-desc">{c.desc}</span>
              <span className="cleaner-category-size">{formatSize(c.size || 0)}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
