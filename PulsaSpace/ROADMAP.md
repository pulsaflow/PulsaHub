# PulsaSpace — Roadmap exhaustive

Référence : WinDirStat, WizTree, TreeSize Pro, CCleaner, BleachBit, Glary Utilities, Autoruns (Sysinternals).

---

## Progression globale

```
█████████░░░░░░░░░░░░░░░░░░░░░░░  ~12% (35/280)
```

**Dernière mise à jour** : Mars 2026

---

## Légende

| Icône | Signification |
|-------|---------------|
| ✅ | Implémenté |
| 🔄 | En cours |
| ⏳ | À faire |
| ❌ | Hors scope |

---

## PHASE 1 — Disques & arborescence

### 1.1 Détection des disques

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 1 | Liste des disques locaux (C:, D:…) | ✅ |
| 2 | Taille totale par disque | ✅ |
| 3 | Espace libre par disque | ✅ |
| 4 | Espace utilisé par disque | ✅ |
| 5 | Barre de remplissage visuelle par disque | ✅ |
| 6 | Alertes disque presque plein (> 90%) | ✅ |
| 7 | Type de disque (HDD / SSD / NVMe / USB) | ✅ |
| 8 | Disques réseau (NAS, SMB) | ✅ |
| 9 | Partition et système de fichiers (NTFS, FAT32, exFAT) | ✅ |
| 10 | Rafraîchissement automatique des infos disque | ✅ |

### 1.2 Scan d'arborescence

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 11 | Scan arborescence complet | ✅ |
| 12 | Scan d'un dossier personnalisé (pas un disque entier) | ✅ |
| 13 | Profondeur de scan configurable | ✅ |
| 14 | Scan en arrière-plan (Worker Thread) | ✅ |
| 15 | Barre de progression du scan (dossiers scannés / total) | ✅ |
| 16 | Estimation du temps restant | ⏳ |
| 17 | Annulation du scan en cours | ✅ |
| 18 | Résumé post-scan (nb fichiers, nb dossiers, durée) | ✅ |
| 19 | Ignorer les fichiers système protégés (option) | ✅ |
| 20 | Ignorer les points de montage et jonctions | ✅ |
| 21 | Accès limité : signaler les dossiers inaccessibles | ✅ |
| 22 | Cache du dernier scan (résultats persistants) | ✅ |
| 23 | Rafraîchissement partiel (dossier modifié seulement) | ✅ |

### 1.3 Vue arborescence

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 24 | Vue arborescence expandable/collapsable | ✅ |
| 25 | Tri par taille décroissante | ✅ |
| 26 | Tri par nom | ✅ |
| 27 | Tri par nombre de fichiers | ✅ |
| 28 | Tri par date de modification | ✅ |
| 29 | Tri par type (fichier / dossier) | ⏳ |
| 30 | Tri par colonne (clic en-tête) | ✅ |
| 31 | Colonne : taille réelle | ✅ |
| 32 | Colonne : taille sur disque (avec clusters) | ⏳ |
| 33 | Colonne : nombre de fichiers | ✅ |
| 34 | Colonne : pourcentage du parent | ✅ |
| 35 | Colonne : date de dernière modification | ✅ |
| 36 | Colonne : propriétaire (ACL Windows) | ⏳ |
| 37 | Colonnes réorganisables et redimensionnables | ⏳ |
| 38 | Virtualisation de la liste (performance > 100 000 entrées) | ⏳ |
| 39 | Mise en évidence des plus grands dossiers | ✅ |
| 40 | Navigation clavier (flèches, Entrée, Backspace) | ✅ |

### 1.4 Tree Map (visualisation rectangles)

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 41 | Tree map de base (algorithme squarified) | ✅ |
| 42 | Couleurs par type de fichier (.exe, .mp4, .docx…) | ⏳ |
| 43 | Tooltip au survol (nom, taille, chemin) | ✅ |
| 44 | Clic → sélectionner dans l'arborescence | ✅ |
| 45 | Double-clic → naviguer dans le dossier | ⏳ |
| 46 | Zoom sur un dossier (breadcrumb navigation) | ⏳ |
| 47 | Légende des couleurs | ⏳ |
| 48 | Animation de transition lors du zoom | ⏳ |
| 49 | Redimensionnement du panneau (splitter) | ✅ |
| 50 | Mode "voronoi" alternatif (optionnel) | ⏳ |

### 1.5 Actions sur fichiers/dossiers

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 51 | Sélectionner un fichier / dossier | ✅ |
| 52 | Multi-sélection (Ctrl+clic, Shift+clic) | ✅ |
| 53 | Menu contextuel clic droit | ✅ |
| 54 | Ouvrir dans l'Explorateur Windows | ✅ |
| 55 | Ouvrir le fichier avec son application | ⏳ |
| 56 | Supprimer (vers corbeille) | ✅ |
| 57 | Supprimer définitivement | ⏳ |
| 58 | Copier le chemin dans le presse-papiers | ✅ |
| 59 | Renommer | ⏳ |
| 60 | Propriétés Windows (shell) | ✅ |
| 61 | Exclure du scan | ⏳ |
| 62 | Déplacer vers un autre dossier | ⏳ |

### 1.6 Recherche & filtrage

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 63 | Recherche en temps réel par nom | ✅ |
| 64 | Filtrage par extension (*.mp4, *.iso…) | ⏳ |
| 65 | Filtrage par taille minimale (> 100 Mo) | ✅ |
| 66 | Filtrage par date (modifié il y a > 1 an) | ⏳ |
| 67 | Expressions régulières | ⏳ |
| 68 | Top 100 plus gros fichiers du disque | ✅ |
| 69 | Top 50 plus gros dossiers | ✅ |
| 70 | Fichiers dupliqués (même hash MD5/SHA-1) | ⏳ |
| 71 | Fichiers vides (0 octet) | ⏳ |
| 72 | Dossiers vides | ✅ |
| 73 | Fichiers jamais ouverts (accès > 1 an) | ⏳ |
| 74 | Vieux fichiers (modifiés > 2 ans) | ⏳ |

---

## PHASE 2 — Nettoyage

### 2.1 Fichiers temporaires Windows

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 75 | Analyse des fichiers nettoyables | ✅ |
| 76 | Dossier %TEMP% et %TMP% | ✅ |
| 77 | Dossier Prefetch | ⏳ |
| 78 | Dossier Windows\Temp | ⏳ |
| 79 | Fichiers .tmp globaux | ⏳ |
| 80 | Rapports d'erreur Windows (WER) | ⏳ |
| 81 | Fichiers dump de mémoire (*.dmp) | ⏳ |
| 82 | Fichiers d'installation en attente | ⏳ |
| 83 | Dossier SoftwareDistribution\Download (Windows Update) | ⏳ |
| 84 | Anciennes versions Windows (Windows.old) | ⏳ |
| 85 | Miniatures Windows (thumbs.db, iconcache.db) | ⏳ |
| 86 | Log Windows (Event Logs) | ⏳ |
| 87 | Fichiers de pagefile.sys (optionnel, avancé) | ⏳ |
| 88 | Corbeille (tous les disques) | ⏳ |
| 89 | Fichiers temporaires par app (Steam, Office, etc.) | ⏳ |

### 2.2 Cache navigateurs

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 90 | Cache Google Chrome | ✅ |
| 91 | Cache Microsoft Edge | ✅ |
| 92 | Cache Mozilla Firefox | ✅ |
| 93 | Cache Brave | ⏳ |
| 94 | Cache Opera | ⏳ |
| 95 | Cache Vivaldi | ⏳ |
| 96 | Historique de navigation (Chrome, Edge, Firefox) | ⏳ |
| 97 | Cookies (option séparée) | ⏳ |
| 98 | Données de formulaires auto-complétion | ⏳ |
| 99 | Mots de passe enregistrés (option avancée, avec avertissement) | ⏳ |
| 100 | Sessions enregistrées | ⏳ |
| 101 | Détection automatique des navigateurs installés | ⏳ |

### 2.3 Applications tierces

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 102 | Cache Microsoft Office (Word, Excel, PPT) | ⏳ |
| 103 | Cache Steam (shader cache, logs) | ⏳ |
| 104 | Cache Discord | ⏳ |
| 105 | Cache Spotify | ⏳ |
| 106 | Cache Adobe (Photoshop, Illustrator, Premiere) | ⏳ |
| 107 | Cache VS Code | ⏳ |
| 108 | Cache npm / yarn / pnpm | ⏳ |
| 109 | Cache pip / conda | ⏳ |
| 110 | Cache Docker (images non utilisées) | ⏳ |
| 111 | Log Minecraft | ⏳ |
| 112 | Règles de nettoyage personnalisées (chemin + masque) | ⏳ |
| 113 | Import/export de règles personnalisées (JSON) | ⏳ |

### 2.4 Registre Windows

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 114 | Scan des entrées orphelines (désinstallateurs) | ⏳ |
| 115 | Clés de logiciels désinstallés | ⏳ |
| 116 | Associations de fichiers invalides | ⏳ |
| 117 | Chemins DLL manquants | ⏳ |
| 118 | Raccourcis invalides (cible manquante) | ⏳ |
| 119 | Historique des MRU (Most Recently Used) | ⏳ |
| 120 | Sauvegarde automatique du registre avant nettoyage | ⏳ |
| 121 | Restauration de la sauvegarde du registre | ⏳ |
| 122 | Aperçu de chaque clé à supprimer | ⏳ |
| 123 | ⚠️ Mode sûr (ne supprimer que les entrées certaines) | ⏳ |

### 2.5 Doublons

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 124 | Scan de doublons par hash MD5 | ⏳ |
| 125 | Scan de doublons par hash SHA-256 | ⏳ |
| 126 | Scan de doublons par nom + taille | ⏳ |
| 127 | Scan de doublons d'images (similaires, pas identiques) | ⏳ |
| 128 | Groupe les doublons et suggère lesquels garder | ⏳ |
| 129 | Sélection automatique (garder le plus récent) | ⏳ |
| 130 | Aperçu des doublons côte à côte | ⏳ |
| 131 | Suppression en lot | ⏳ |

### 2.6 Workflow nettoyage

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 132 | Analyse avant nettoyage (dry-run) | ⏳ |
| 133 | Prévisualisation liste des fichiers ciblés | ⏳ |
| 134 | Rapport nettoyage (nb fichiers, taille libérée) | ⏳ |
| 135 | Confirmation avant suppression | ⏳ |
| 136 | Annulation du nettoyage en cours | ⏳ |
| 137 | Barre de progression du nettoyage | ⏳ |
| 138 | Nettoyage planifié (tâche Windows) | ⏳ |
| 139 | Nettoyage au démarrage (silencieux) | ⏳ |
| 140 | Historique des nettoyages (date, taille libérée) | ⏳ |
| 141 | Exclusions globales (ne jamais toucher ces chemins) | ⏳ |
| 142 | Effacement sécurisé (DoD 7 passes) | ⏳ |

---

## PHASE 3 — Gestion du démarrage

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 143 | Liste des programmes au démarrage (Registre + dossier) | ⏳ |
| 144 | Activation / désactivation | ⏳ |
| 145 | Suppression d'une entrée de démarrage | ⏳ |
| 146 | Ajout d'un programme au démarrage | ⏳ |
| 147 | Impact sur le démarrage (léger / moyen / lourd) | ⏳ |
| 148 | Délai de démarrage différé par programme | ⏳ |
| 149 | Tâches planifiées Windows (aperçu) | ⏳ |
| 150 | Services Windows (liste, état, démarrage auto) | ⏳ |
| 151 | Désactiver les services inutiles (avec avertissements) | ⏳ |
| 152 | Estimation du gain de temps au démarrage | ⏳ |
| 153 | Sauvegarde des configurations de démarrage | ⏳ |
| 154 | Extensions de navigateurs (Chrome, Edge) | ⏳ |

---

## PHASE 4 — Informations système

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 155 | CPU : modèle, fréquence, cœurs, charge en temps réel | ⏳ |
| 156 | RAM : totale, utilisée, libre, vitesse | ⏳ |
| 157 | GPU : modèle, mémoire VRAM, charge | ⏳ |
| 158 | Carte mère : marque, modèle, BIOS | ⏳ |
| 159 | Disques : modèle, interface (SATA/NVMe), température | ⏳ |
| 160 | Réseau : interfaces, IP, débit | ⏳ |
| 161 | OS : version Windows, build, activation | ⏳ |
| 162 | Température CPU / GPU (via WMI ou senseurs) | ⏳ |
| 163 | Uptime système | ⏳ |
| 164 | Processus actifs (PID, RAM, CPU) | ⏳ |
| 165 | Export rapport système (PDF ou HTML) | ⏳ |
| 166 | Copier toutes les infos dans le presse-papiers | ⏳ |

---

## PHASE 5 — Outils système avancés

### 5.1 Désinstallation propre

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 167 | Liste des programmes installés | ⏳ |
| 168 | Taille de chaque installation | ⏳ |
| 169 | Date d'installation et dernière utilisation | ⏳ |
| 170 | Lancer le désinstallateur natif | ⏳ |
| 171 | Nettoyage post-désinstallation (restes de registre + fichiers) | ⏳ |
| 172 | Désinstallation de plusieurs apps en lot | ⏳ |

### 5.2 Vie privée

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 173 | Effacement de l'historique du menu Démarrer | ⏳ |
| 174 | Effacement de l'historique des fichiers récents | ⏳ |
| 175 | Effacement de l'historique de l'Explorateur Windows | ⏳ |
| 176 | Effacement des Jump Lists | ⏳ |
| 177 | Effacement de l'historique de la barre de recherche | ⏳ |
| 178 | Désactiver la télémétrie Windows (partielle) | ⏳ |
| 179 | Effacement des logs d'activité Windows | ⏳ |
| 180 | Effacement presse-papiers | ⏳ |
| 181 | Mode "nettoyage vie privée" (tout en un clic) | ⏳ |

### 5.3 Récupération de fichiers

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 182 | Scan de la corbeille pour restauration | ⏳ |
| 183 | Récupération de fichiers supprimés (secteurs libres) | ⏳ |
| 184 | Filtrer par type de fichier à récupérer | ⏳ |
| 185 | Aperçu avant récupération | ⏳ |

---

## PHASE 6 — Interface & visualisation

### 6.1 Layout

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 186 | Barre de titre Windows 11 (sans bordure) | ✅ |
| 187 | Sidebar de navigation | ✅ |
| 188 | Vue principale dynamique par onglet | ✅ |
| 189 | Panneau de détails (à droite) | ⏳ |
| 190 | Splitter redimensionnable (liste / tree map) | ⏳ |
| 191 | Mode plein écran | ⏳ |
| 192 | Mémoriser taille / position de fenêtre | ⏳ |
| 193 | Barre d'état (bas) : nb fichiers, taille totale, temps scan | ⏳ |

### 6.2 Thèmes & apparence

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 194 | Thème sombre | ✅ |
| 195 | Thème clair | ✅ |
| 196 | Suivre le thème système Windows | ⏳ |
| 197 | Taille de police configurable | ⏳ |
| 198 | Densité d'affichage (compact / normal / spacieux) | ⏳ |
| 199 | Icônes de types de fichiers (associées à Windows) | ⏳ |
| 200 | Couleurs du tree map personnalisables | ⏳ |

### 6.3 Raccourcis clavier

| # | Raccourci | Statut |
|---|-----------|--------|
| 201 | Ctrl+R — Relancer le scan | ⏳ |
| 202 | Ctrl+F — Recherche | ⏳ |
| 203 | Ctrl+, — Paramètres | ⏳ |
| 204 | Suppr — Supprimer sélection | ⏳ |
| 205 | F5 — Actualiser | ⏳ |
| 206 | Ctrl+C — Copier le chemin | ⏳ |
| 207 | Entrée — Ouvrir dans l'Explorateur | ⏳ |
| 208 | Backspace — Remonter d'un niveau | ⏳ |
| 209 | Ctrl+A — Tout sélectionner | ⏳ |
| 210 | Ctrl+1/2/3 — Changer de section | ⏳ |
| 211 | Raccourcis personnalisables | ⏳ |

### 6.4 Notifications & feedback

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 212 | Toast succès / erreur / info | ✅ |
| 213 | Notification système fin de scan | ⏳ |
| 214 | Notification fin de nettoyage (taille libérée) | ⏳ |
| 215 | Alerte disque presque plein | ⏳ |
| 216 | Son de fin (optionnel) | ⏳ |
| 217 | Barre de progression globale | ⏳ |
| 218 | Indicateur de vitesse (Mo/s scannés) | ⏳ |

---

## PHASE 7 — Graphiques & rapports

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 219 | Camembert (pie chart) répartition par type de fichier | ⏳ |
| 220 | Histogramme : évolution de l'espace libre dans le temps | ⏳ |
| 221 | Graphique en anneau (donut) pour le disque | ⏳ |
| 222 | Top 10 extensions les plus volumineuses | ⏳ |
| 223 | Rapport HTML exportable | ⏳ |
| 224 | Rapport CSV (arborescence + tailles) | ⏳ |
| 225 | Rapport PDF | ⏳ |
| 226 | Rapport JSON (pour intégration tierce) | ⏳ |
| 227 | Comparaison avant / après nettoyage | ⏳ |
| 228 | Historique de l'espace libre (graphique sur 30 jours) | ⏳ |

---

## PHASE 8 — Paramètres & configuration

| # | Option | Statut |
|---|--------|--------|
| 229 | Lancer au démarrage de Windows | ⏳ |
| 230 | Réduire dans la barre système (tray) | ⏳ |
| 231 | Langue (FR, EN, ES, DE…) | ⏳ |
| 232 | Unité de taille (auto / o Ko Mo Go To) | ⏳ |
| 233 | Format de date | ⏳ |
| 234 | Dossiers exclus du scan (liste noire) | ⏳ |
| 235 | Profondeur de scan par défaut | ⏳ |
| 236 | Niveau d'agressivité du nettoyage (normal / agressif) | ⏳ |
| 237 | Confirmation avant suppression | ⏳ |
| 238 | Nettoyage vers corbeille ou suppression directe | ⏳ |
| 239 | Scan automatique au lancement | ⏳ |
| 240 | Scan planifié (quotidien / hebdomadaire) | ⏳ |
| 241 | Export des paramètres (JSON) | ⏳ |
| 242 | Import des paramètres | ⏳ |
| 243 | Réinitialiser les paramètres | ⏳ |
| 244 | Mise à jour automatique | ⏳ |

---

## PHASE 9 — Intégration système Windows

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 245 | Menu contextuel Explorateur : "Analyser avec PulsaSpace" | ⏳ |
| 246 | Menu contextuel sur un dossier : taille instantanée | ⏳ |
| 247 | Icône dans la barre système (System Tray) | ⏳ |
| 248 | Alerte tray disque plein | ⏳ |
| 249 | Lancement via ligne de commande (scan path, clean) | ⏳ |
| 250 | Argument `--scan C:\` | ⏳ |
| 251 | Argument `--clean temp,browser` | ⏳ |
| 252 | Argument `--report output.html` | ⏳ |
| 253 | Raccourci Bureau / Menu Démarrer | ⏳ |
| 254 | Intégration Windows Search | ⏳ |

---

## PHASE 10 — Distribution & mise à jour

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 255 | Installateur NSIS | ⏳ |
| 256 | Installateur MSI | ⏳ |
| 257 | Version portable (sans installation) | ⏳ |
| 258 | Auto-update (electron-updater) | ⏳ |
| 259 | Signature de l'exécutable (Authenticode) | ⏳ |
| 260 | Winget | ⏳ |
| 261 | Chocolatey / Scoop | ⏳ |

---

## PHASE 11 — Performance & robustesse

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 262 | Worker Thread pour le scan (UI jamais bloquée) | ⏳ |
| 263 | Virtualisation de la liste (react-virtual) | ⏳ |
| 264 | Lazy loading de l'arborescence | ⏳ |
| 265 | Pagination interne pour dossiers > 10 000 entrées | ⏳ |
| 266 | Gestion mémoire scan très grand disque (> 1 To) | ⏳ |
| 267 | IPC chunking (envoyer l'arborescence par morceaux) | ⏳ |
| 268 | Cache persistant des derniers résultats (electron-store) | ⏳ |
| 269 | Profiling des performances internes | ⏳ |

---

## PHASE 12 — Qualité & tests

| # | Fonctionnalité | Statut |
|---|----------------|--------|
| 270 | Tests unitaires (Vitest) | ⏳ |
| 271 | Tests intégration (mock Electron IPC) | ⏳ |
| 272 | Tests E2E (Playwright) | ⏳ |
| 273 | CI/CD (GitHub Actions) | ⏳ |
| 274 | Couverture de code > 70% | ⏳ |
| 275 | Rapport d'erreur (crash reporter) | ⏳ |
| 276 | Logs structurés (electron-log) | ⏳ |
| 277 | Mode debug accessible (Ctrl+Shift+I) | ⏳ |
| 278 | Accessibilité WCAG 2.1 AA | ⏳ |
| 279 | Support lecteurs d'écran | ⏳ |
| 280 | Internationalisation complète (react-i18next) | ⏳ |

---

## Tableau de bord

| Phase | Domaine | Fait | Total | % |
|-------|---------|------|-------|---|
| 1 | Disques & arborescence | 30 | 73 | 41% |
| 2 | Nettoyage | 5 | 68 | 7% |
| 3 | Démarrage | 0 | 12 | 0% |
| 4 | Informations système | 0 | 12 | 0% |
| 5 | Outils avancés | 0 | 19 | 0% |
| 6 | Interface & UX | 5 | 36 | 14% |
| 7 | Graphiques & rapports | 0 | 10 | 0% |
| 8 | Paramètres | 0 | 16 | 0% |
| 9 | Intégration Windows | 0 | 10 | 0% |
| 10 | Distribution | 0 | 7 | 0% |
| 11 | Performance | 0 | 8 | 0% |
| 12 | Qualité & tests | 0 | 11 | 0% |
| **—** | **TOTAL** | **~35** | **~280** | **~12%** |

---

## Prochaines priorités (sprint actuel)

1. **Tree map visuel** (Phase 1.4) — visualisation rectangles squarified
2. **Barre de progression du scan** (Phase 1.2)
3. **Worker Thread** pour le scan (Phase 11)
4. **Top 100 plus gros fichiers** (Phase 1.6)
5. **Toast notifications** (Phase 6.4)
6. **Barre de remplissage disque** (Phase 1.1)
7. **Rapport HTML** post-nettoyage (Phase 7)
8. **Mémorisation position/taille fenêtre** (Phase 6.1)

---

*Roadmap vivante — mise à jour régulière*
