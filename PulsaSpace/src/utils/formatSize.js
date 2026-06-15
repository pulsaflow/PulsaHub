/**
 * PulsaSpace — Formatage des tailles et dates
 */

/**
 * Formate une taille en octets en chaîne lisible.
 */
export function formatSize(bytes) {
  if (bytes === 0) return '0 o'
  if (typeof bytes !== 'number' || !Number.isFinite(bytes)) return '—'
  const units = ['o', 'Ko', 'Mo', 'Go', 'To']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(i === 0 ? 0 : 1).replace('.', ',')} ${units[i]}`
}

/**
 * Formate un timestamp en date lisible.
 */
export function formatDate(ms) {
  if (ms == null || typeof ms !== 'number') return '—'
  const d = new Date(ms)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
