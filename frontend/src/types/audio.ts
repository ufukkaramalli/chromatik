export const TRACK_KEYS = [
  'C Maj', 'C Min',
  'C# / Db Maj', 'C# / Db Min',
  'D Maj', 'D Min',
  'D# / Eb Maj', 'D# / Eb Min',
  'E Maj', 'E Min',
  'F Maj', 'F Min',
  'F# / Gb Maj', 'F# / Gb Min',
  'G Maj', 'G Min',
  'G# / Ab Maj', 'G# / Ab Min',
  'A Maj', 'A Min',
  'A# / Bb Maj', 'A# / Bb Min',
  'B Maj', 'B Min'
] as const;

export type TrackKey = typeof TRACK_KEYS[number];

export interface TrackUser {
  name: string
  slug: string
  _id?: string
  /** Artist's profile theme: 'ribbons' | 'flowfield' | 'pillars' */
  profileTheme?: string
}

export interface TrackLoudness {
  /** Integrated loudness (LUFS, EBU R128) */
  integrated: number
  /** True peak (dBTP) */
  truePeak: number
  measuredAt?: string
}

export interface Track {
  id: string
  /** Mongo id (API payloads may carry this instead of / in addition to `id`) */
  _id?: string
  name: string
  slug?: string
  art: string
  url: string
  duration: number
  bpm?: number
  key?: TrackKey | string | null
  likes?: number
  likedBy?: string[]
  /** Server-measured loudness, absent until the track is analysed */
  loudness?: TrackLoudness | null
  user: TrackUser
  userId?: string
  priceBasic?: number
  pricePremium?: number
  priceUnlimited?: number
  priceExclusive?: number
}

/** Loose track shape accepted by cards (e.g. BoxPlayer): API payloads are often partial */
export type TrackLike = Partial<Omit<Track, 'user'>> & {
  user?: Partial<TrackUser>
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
  playbackRate: number // 0.5 - 2.0 (default 1.0)
  pitchSemitones: number // -12 to +12 (default 0)
}

export type RepeatMode = 'off' | 'all' | 'one'

export interface AudioEngineEvents {
  'state-change': (state: PlayerState['status']) => void
  'time-update': (currentTime: number, duration: number) => void
  'track-ended': () => void
  'buffer-update': (buffered: number) => void
  'error': (error: Error) => void
  'analyser-ready': (analyser: AnalyserNode) => void
  'rate-change': (rate: number) => void
  'pitch-change': (semitones: number) => void
  /** gainDb is the gain applied to the current track (null = not analysed / disabled) */
  'normalization-change': (enabled: boolean, gainDb: number | null) => void
}
