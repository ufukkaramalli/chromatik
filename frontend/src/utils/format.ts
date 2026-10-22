export function formatTime(seconds: number | null | undefined, padMinutes = false): string {
  if (seconds == null || isNaN(seconds) || seconds < 0) {
    return padMinutes ? '00:00' : '0:00'
  }
  
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const mStr = padMinutes ? m.toString().padStart(2, '0') : m.toString()
  
  return `${mStr}:${s.toString().padStart(2, '0')}`
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0s'
  
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

/**
 * Formats large numbers compactly for UI badges, counts, and metrics.
 * Examples: 6 -> '6', 1500 -> '1.5K+', 1000000 -> '1M+'
 */
export function formatCompactNumber(num: number | string | null | undefined): string {
  const n = Number(num) || 0
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M+'
  }
  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K+'
  }
  return n.toLocaleString()
}
