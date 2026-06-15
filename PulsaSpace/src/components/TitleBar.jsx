/**
 * PulsaSpace — Barre de titre style Windows 11
 * Logo, nom de l'app, boutons Réduire / Agrandir / Fermer.
 */

import { HardDrive, Settings } from 'lucide-react'
import './TitleBar.css'

export default function TitleBar({ onSettingsClick }) {
  const isElectron = typeof window !== 'undefined' && window.pulsaspace

  const handleMinimize = () => {
    if (isElectron) window.pulsaspace.send('window-minimize')
  }

  const handleMaximize = () => {
    if (isElectron) window.pulsaspace.send('window-maximize')
  }

  const handleClose = () => {
    if (isElectron) window.pulsaspace.send('window-close')
  }

  return (
    <header className="title-bar">
      <div className="title-bar-brand">
        <div className="title-bar-logo">
          <HardDrive size={20} strokeWidth={2} className="title-bar-logo-icon" />
        </div>
        <span className="title-bar-name">PulsaSpace</span>
      </div>
      <div className="title-bar-actions">
        {onSettingsClick && (
          <button
            type="button"
            className="title-bar-btn title-bar-btn-settings"
            onClick={onSettingsClick}
            title="Paramètres"
            aria-label="Paramètres"
          >
            <Settings size={18} />
          </button>
        )}
        {isElectron && (
          <>
            <button
              type="button"
              className="title-bar-btn title-bar-btn-minimize"
              onClick={handleMinimize}
              aria-label="Réduire"
            >
              <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
                <rect width="10" height="1" />
              </svg>
            </button>
            <button
              type="button"
              className="title-bar-btn title-bar-btn-maximize"
              onClick={handleMaximize}
              aria-label="Agrandir"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <rect width="10" height="10" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </button>
            <button
              type="button"
              className="title-bar-btn title-bar-btn-close"
              onClick={handleClose}
              aria-label="Fermer"
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M0 0L10 10M10 0L0 10" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </>
        )}
      </div>
    </header>
  )
}
