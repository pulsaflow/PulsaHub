/**
 * PulsaSpace — Application principale
 * Layout : TitleBar + Sidebar + contenu dynamique.
 */

import { useState } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import DiskAnalysis from './components/DiskAnalysis'
import Cleaner from './components/Cleaner'
import StartupView from './components/StartupView'
import AboutView from './components/AboutView'
import SettingsModal from './components/SettingsModal'
import './App.css'

const VIEWS = {
  disk: DiskAnalysis,
  cleaner: Cleaner,
  startup: StartupView,
  about: AboutView,
}

export default function App() {
  const [activeView, setActiveView] = useState('disk')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const ViewComponent = VIEWS[activeView] || DiskAnalysis

  return (
    <div className="app">
      <TitleBar onSettingsClick={() => setSettingsOpen(true)} />
      <div className="app-body">
        <Sidebar activeView={activeView} onSelect={setActiveView} />
        <main className="app-main pulsa-scroll">
          <ViewComponent />
        </main>
      </div>
      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}
