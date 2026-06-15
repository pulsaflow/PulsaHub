/**
 * PulsaSpace — Modal Paramètres
 * Thème, préférences.
 */

import { X } from 'lucide-react'
import './SettingsModal.css'

export default function SettingsModal({ onClose }) {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark'

  const setTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t)
  }

  return (
    <div className="pulsa-modal-overlay" onClick={onClose}>
      <div
        className="pulsa-modal settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-modal-header">
          <h2>Paramètres</h2>
          <button
            type="button"
            className="settings-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="settings-modal-body">
          <div className="settings-group">
            <label className="settings-label">Apparence</label>
            <div className="settings-theme-buttons">
              {['dark', 'light'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`pulsa-btn-secondary ${theme === t ? 'pulsa-btn-secondary--active' : ''}`}
                  onClick={() => setTheme(t)}
                >
                  {t === 'dark' ? 'Sombre' : 'Clair'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
