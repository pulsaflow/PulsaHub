/**
 * PulsaSpace — Vue À propos
 */

import { Info } from 'lucide-react'
import './PlaceholderView.css'

export default function AboutView() {
  return (
    <div className="placeholder-view">
      <Info size={48} className="placeholder-icon" />
      <h2>PulsaSpace</h2>
      <p>Analyseur d&apos;espace disque et nettoyeur système — tout réuni.</p>
      <p className="placeholder-version">Version 0.1.0</p>
      <p className="placeholder-credits">Partie de la suite Pulsa — PulsaZip, PulsaSpace, PulsaHash…</p>
    </div>
  )
}
