# Pulsa CSS v2.0

**Framework CSS dark-first** — 300+ composants, thèmes dynamiques, animations fluides, zéro dépendance JavaScript.

Conçu pour dashboards, applications web, SaaS, interfaces modernes et tout projet nécessitant un design system sombre et thémable.

---

## Installation

### npm (recommandé)
```bash
npm install pulsa-css
```

```js
// Bundler (Vite, Webpack, etc.)
import 'pulsa-css';
```

### CDN
```html
<link rel="stylesheet" href="https://unpkg.com/pulsa-css/pulsa.css">
```

### Import sélectif
```css
@import 'pulsa-css/pulsa-tokens.css';    /* REQUIS en premier */
@import 'pulsa-css/pulsa-base.css';
@import 'pulsa-css/pulsa-components.css';
@import 'pulsa-css/pulsa-extras.css';
@import 'pulsa-css/pulsa-utilities.css';
```

---

## Configuration

### Thème (dark/light)
```html
<html data-theme="dark">   <!-- défaut -->
<html data-theme="light">
```

### Accent couleur
```html
<!-- rose | purple | blue | green | orange | pink -->
<html data-accent="rose">
```

### Fond lumineux
```html
<body class="pulsa-bg-glow">
```

---

## Structure des fichiers

| Fichier | Contenu |
|---|---|
| `pulsa.css` | Import complet (entry point) |
| `pulsa-tokens.css` | Variables CSS — couleurs, typo, spacing, radius |
| `pulsa-base.css` | Reset global, body, liens, focus |
| `pulsa-animations.css` | Keyframes + classes `.pulsa-animate-*` |
| `pulsa-components.css` | Boutons, badges, cards, tabs, accordion, table… |
| `pulsa-forms.css` | Inputs, toggles, checkboxes, selects, range… |
| `pulsa-layout.css` | Sidebar, hero, grilles, page wrappers |
| `pulsa-extras.css` | Avatar, progress, timeline, toast, dropdown… |
| `pulsa-utilities.css` | Classes flex, spacing, typo, couleurs… |

---

## Composants inclus

### Base
- Boutons : primary, secondary, ghost, danger, success, social — sizes xs→xl, pill, icon, ripple
- Badges : accent, success, danger, warning, muted, live, pill, tags
- Cards : standard, accent, stat, summary, action, info, feature, placeholder

### Navigation
- Tabs (fond + underline), Segmented control, Breadcrumb, Sidebar nav
- Pagination, Stepper (steps), Back to top

### Contenu
- Alert (info/success/warning/danger/tip), Callout
- Table, List, Timeline, Activity feed
- Chat message, Leaderboard, Giveaway card, Poll

### Overlay
- Dropdown menu (avec header, divider, shortcut)
- Tooltip (via data-tooltip ou .pulsa-tooltip), Popover
- Modal (command palette), FAB

### Formulaires
- Input, Textarea, Input group, Copy field (API key)
- Toggle switch, Checkbox, Radio card, Custom select
- Range slider, PIN input, Color grid, Presets

### Extras
- Avatar (xs→2xl, status dot, groupe)
- Progress bar (striped, animé, success/danger), Progress ring
- Toast container (success/danger/warning/info)
- Counter avec diff, Rating stars, KBD shortcuts
- Chip group, Notification badge (dot/count/ping)
- Profile card, Pricing card, Banner, Divider label
- Social links, Footer, Color swatch grid

### Communauté & chat
- Rôle coloré, Channel tag (#), @mention
- Slash command display, Command reference table
- Permissions grid (allowed/denied/neutral)
- Server card, Music card, Equalizer animé, Queue item
- Poll options, Giveaway card, Level badge, XP bar

### Animations
- Entrées : fade-in, fade-in-up, fade-in-down, slide-left/right, scale-in, pop, shake
- Hover : lift, scale, glow, bright, accent-border
- Boucles : pulse, bounce, float, spin, ping, blink
- Stagger delays : delay-0 → delay-800
- Skeleton shimmer, progress fill, equalizer

---

## Site & documentation

Une fois le dépôt poussé sur GitHub et GitHub Pages activé (Settings → Pages → Source : **GitHub Actions**) :

- **Site de présentation** : [gabrielrevest.github.io/PulsaHub](https://gabrielrevest.github.io/PulsaHub/)
- **Documentation** : [gabrielrevest.github.io/PulsaHub/docs.html](https://gabrielrevest.github.io/PulsaHub/docs.html)

---

## Licence

MIT © PulsaHub 2026
