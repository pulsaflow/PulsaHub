import { useMemo, useState } from 'react'
import { formatSize } from '../utils/formatSize'
import './TreeMap.css'

// --- Algorithme Squarified Treemap ---
// Adapté en JavaScript brut pour s'intégrer facilement

function getWorstRatio(row, w) {
  if (row.length === 0) return Infinity
  let min = Infinity
  let max = -Infinity
  let sum = 0
  for (const node of row) {
    const s = node._size
    if (s < min) min = s
    if (s > max) max = s
    sum += s
  }
  const w2 = w * w
  const sum2 = sum * sum
  return Math.max(
    (w2 * max) / sum2,
    sum2 / (w2 * min)
  )
}

function layoutRow(row, w, x, y, width, height) {
  let sum = 0
  for (const n of row) sum += n._size

  let res = []
  if (width >= height) {
    // Remplissage horizontal (empilement vertical)
    const rowWidth = sum / height
    let curY = y
    for (const n of row) {
      const h = n._size / rowWidth
      res.push({ node: n, x, y: curY, w: rowWidth, h })
      curY += h
    }
    return { rects: res, newX: x + rowWidth, newY: y, newW: width - rowWidth, newH: height }
  } else {
    // Remplissage vertical (empilement horizontal)
    const rowHeight = sum / width
    let curX = x
    for (const n of row) {
      const wNode = n._size / rowHeight
      res.push({ node: n, x: curX, y, w: wNode, h: rowHeight })
      curX += wNode
    }
    return { rects: res, newX: x, newY: y + rowHeight, newW: width, newH: height - rowHeight }
  }
}

function squarify(children, rect) {
  // children attendus triés par taille décroissante et avec _size adapté à la surface du rect
  const result = []
  let currentRow = []
  let { x, y, w, h } = rect

  for (let i = 0; i < children.length; i++) {
    const c = children[i]
    if (c._size <= 0) continue

    const length = Math.min(w, h)
    const worstWithC = getWorstRatio([...currentRow, c], length)
    const worstWithoutC = getWorstRatio(currentRow, length)

    if (currentRow.length === 0 || worstWithC <= worstWithoutC) {
      currentRow.push(c)
    } else {
      const { rects, newX, newY, newW, newH } = layoutRow(currentRow, length, x, y, w, h)
      result.push(...rects)
      x = newX
      y = newY
      w = newW
      h = newH
      currentRow = [c]
    }
  }

  if (currentRow.length > 0) {
    const { rects } = layoutRow(currentRow, Math.min(w, h), x, y, w, h)
    result.push(...rects)
  }

  return result
}

// Couleurs pré-sélectionnées basées sur le hash du nom
const COLORS = [
  '#4f46e5', // indigo
  '#0ea5e9', // light blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // blue-indigo
  '#84cc16', // lime
  '#06b6d4', // cyan
]

function getHashColor(str) {
  if (!str) return COLORS[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function TreeMap({ data, width, height, onSelect, selectedPaths }) {
  const [hoveredNode, setHoveredNode] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const rects = useMemo(() => {
    if (!data || !width || !height || !data.children || data.children.length === 0) return []
    // On ignore le dossier parent en lui-même, on n'affiche que ses enfants de 1er et 2ème niveau (pour ne pas surcharger)
    
    // 1. Filtrer et trier
    const validChildren = data.children.filter((c) => c.size > 0).sort((a, b) => b.size - a.size)
    let totalSize = validChildren.reduce((acc, c) => acc + c.size, 0)
    if (totalSize === 0) totalSize = 1 

    const totalArea = width * height
    
    // Phase 1 : Niveau 1
    const lvl1Norm = validChildren.map(c => ({
      ...c,
      _originalSize: c.size,
      _size: (c.size / totalSize) * totalArea,
      _color: getHashColor(c.name)
    }))

    const lvl1Layout = squarify(lvl1Norm, { x: 0, y: 0, w: width, h: height })
    const allRects = []

    // Phase 2 : Sous-niveaux (Niveau 2)
    lvl1Layout.forEach((l1) => {
      // Marge interne
      const PADDING = 2
      const innerW = Math.max(0, l1.w - PADDING * 2)
      const innerH = Math.max(0, l1.h - PADDING * 2 - 20) // -20 pour le header

      const hasChildren = l1.node.children && l1.node.children.length > 0 && innerW > 10 && innerH > 10

      if (!hasChildren) {
        // Pas d'enfants affichables, on ajoute juste le bloc global
        allRects.push({
          id: l1.node.path,
          node: l1.node,
          x: l1.x, y: l1.y, w: l1.w, h: l1.h,
          color: l1.node._color,
          isLeaf: true,
          level: 1
        })
      } else {
        // Ajout du Parent Container
        allRects.push({
          id: l1.node.path,
          node: l1.node,
          x: l1.x, y: l1.y, w: l1.w, h: l1.h,
          color: l1.node._color,
          isLeaf: false,
          level: 1
        })

        // Enfants du niveau 2
        const validC2 = l1.node.children.filter(c => c.size > 0).sort((a, b) => b.size - a.size)
        // Prendre le top 20 max pour perf
        const topC2 = validC2.slice(0, 20)
        let subTotal = topC2.reduce((acc, c) => acc + c.size, 0)
        if (subTotal === 0) subTotal = 1

        const subArea = innerW * innerH
        const lvl2Norm = topC2.map(c => ({
          ...c,
          _originalSize: c.size,
          _size: (c.size / subTotal) * subArea
        }))

        const lvl2Layout = squarify(lvl2Norm, {
          x: l1.x + PADDING,
          y: l1.y + PADDING + 20,
          w: innerW,
          h: innerH
        })

        lvl2Layout.forEach(l2 => {
          allRects.push({
            id: l2.node.path,
            node: l2.node,
            x: l2.x, y: l2.y, w: l2.w, h: l2.h,
            color: l1.node._color, // On garde la teinte du parent, on changera l'opacité en CSS
            isLeaf: true,
            level: 2
          })
        })
      }
    })

    return allRects
  }, [data, width, height])

  if (!data || rects.length === 0) {
    return (
      <div className="treemap-empty">
        <span className="treemap-empty-text">Aucune donnée à afficher dans la Tree Map</span>
      </div>
    )
  }

  const handleMouseMove = (e, r) => {
    setHoveredNode(r)
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }

  return (
    <div className="treemap-container">
      {rects.map((r) => {
        // Filtrer les blocs trop petits
        if (r.w < 2 || r.h < 2) return null;
        
        const isSelected = selectedPaths?.has(r.node.path)

        return (
          <div
            key={`${r.level}-${r.id}`}
            className={`treemap-rect ${r.isLeaf ? 'treemap-leaf' : 'treemap-group'} ${isSelected ? 'treemap-rect-selected' : ''}`}
            style={{
              left: `${r.x}px`,
              top: `${r.y}px`,
              width: `${r.w}px`,
              height: `${r.h}px`,
              backgroundColor: r.isLeaf ? r.color : `${r.color}33`, // Transparent pour les groupes
              borderColor: r.isLeaf ? 'rgba(0,0,0,0.2)' : r.color,
            }}
            onClick={() => onSelect && onSelect(r.node)}
            onMouseMove={(e) => r.isLeaf && handleMouseMove(e, r)}
            onMouseLeave={() => r.isLeaf && setHoveredNode(null)}
          >
            {/* Affichage du Label Parent */}
            {!r.isLeaf && r.w > 40 && r.h > 20 && (
              <div className="treemap-group-label" style={{ color: '#fff', backgroundColor: r.color }}>
                {r.node.name}
              </div>
            )}
            
            {/* Liseré des feuilles (si assez de place) */}
            {r.isLeaf && r.w > 30 && r.h > 20 && (
              <div className="treemap-leaf-label">
                <span className="treemap-leaf-name">{r.node.name}</span>
                {r.h > 35 && <span className="treemap-leaf-size">{formatSize(r.node.size)}</span>}
              </div>
            )}
            
            {/* Overlay sélection */}
            {isSelected && <div className="treemap-select-overlay" />}
          </div>
        )
      })}
      
      {/* Tooltip au niveau racine (pour chevaucher les CSS overflows cachés du container si besoin, bien qu'ici il soit internal) */}
      {hoveredNode && (
        <div 
          className="treemap-tooltip"
          style={{
            left: Math.min(tooltipPos.x + 15, window.innerWidth - 200),
            top: Math.min(tooltipPos.y + 15, window.innerHeight - 100),
          }}
        >
          <div className="tooltip-name">{hoveredNode.node.name}</div>
          <div className="tooltip-path">{hoveredNode.node.path}</div>
          <div className="tooltip-size">{formatSize(hoveredNode.node.size)}</div>
        </div>
      )}
    </div>
  )
}
