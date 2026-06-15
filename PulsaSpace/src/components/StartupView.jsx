/**
 * PulsaSpace — Vue Démarrage (programmes au démarrage)
 * Placeholder pour future implémentation.
 */

import { Cpu } from 'lucide-react'
import './PlaceholderView.css'

export default function StartupView() {
  return (
    <div className="placeholder-view">
      <Cpu size={48} className="placeholder-icon" />
      <h2>Programmes au démarrage</h2>
      <p>Gérez les applications qui se lancent au démarrage de Windows.</p>
      <span className="placeholder-badge">Bientôt disponible</span>
    </div>
  )
}
