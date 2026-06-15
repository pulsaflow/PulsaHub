/**
 * PulsaSpace — Barre latérale de navigation
 * Analyse disque, Nettoyage, Paramètres système.
 */

import { HardDrive, Trash2, Cpu, Info } from 'lucide-react'
import './Sidebar.css'

const NAV_ITEMS = [
  { id: 'disk', label: 'Analyse disque', icon: HardDrive },
  { id: 'cleaner', label: 'Nettoyage', icon: Trash2 },
  { id: 'startup', label: 'Démarrage', icon: Cpu },
  { id: 'about', label: 'À propos', icon: Info },
]

export default function Sidebar({ activeView, onSelect }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-item ${activeView === id ? 'sidebar-item--active' : ''}`}
            onClick={() => onSelect(id)}
          >
            <Icon size={20} className="sidebar-item-icon" />
            <span className="sidebar-item-label">{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="sidebar-version">PulsaSpace v0.1</span>
      </div>
    </aside>
  )
}
