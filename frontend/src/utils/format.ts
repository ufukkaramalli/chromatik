export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00'
  
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
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
