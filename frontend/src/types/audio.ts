export interface Track {
  id: string
  name: string
  art: string
  duration: number
  user: { name: string; slug: string }
}

export interface QueueItem {
  track: Track
  queueId: string
}

export interface PlayerState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'error'
  currentTime: number
  duration: number
  buffered: number
  volume: number
  isMuted: boolean
  error: string | null
  crossfadeDuration: number // 0 = off, > 0 = seconds
}

export type RepeatMode = 'off' | 'all' | 'one'

export interface AudioEngineEvents {
  'state-change': (state: PlayerState['status']) => void
  'time-update': (currentTime: number, duration: number) => void
  'track-ended': () => void
  'buffer-update': (buffered: number) => void
  'error': (error: Error) => void
  'analyser-ready': (analyser: AnalyserNode) => void
}
