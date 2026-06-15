# PulsaSpace

**Analyseur d'espace disque et nettoyeur système** — WinDirStat + CCleaner réunis en une app moderne.

Partie de la suite Pulsa (PulsaZip, PulsaSpace, PulsaHash…).

## Fonctionnalités

- **Analyse disque** : visualisation de l'occupation des disques, arborescence par taille
- **Nettoyage** : fichiers temporaires, cache navigateurs, corbeille
- **Démarrage** : gestion des programmes au démarrage (à venir)
- **Thème** : sombre / clair, design system Pulsa (accent cyan)

## Stack

- **Frontend** : React 18, Vite
- **Desktop** : Electron
- **UI** : Pulsa Design System (pulsa-design-system.css)

## Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode dev (Vite + Electron)
npm run electron:dev
```

## Build

```bash
npm run build
npm run electron:build
```

## Structure

```
PulsaSpace/
├── src/
│   ├── components/     # TitleBar, Sidebar, DiskAnalysis, Cleaner...
│   ├── utils/          # formatSize
│   ├── pulsa-design-system.css
│   └── App.jsx
├── electron/
│   ├── main.js         # Point d'entrée Electron, IPC
│   ├── preload.js
│   └── disk-handler.js # Scan disque, nettoyage
└── package.json
```

## Licence

MIT
