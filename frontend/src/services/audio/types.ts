import type { Track } from '@/types/audio'
import type Hls from 'hls.js'

export interface AudioChannel {
  audio: HTMLAudioElement
  source: MediaElementAudioSourceNode
  lowCutFilter: BiquadFilterNode
  hiCutFilter: BiquadFilterNode
  fadeGain: GainNode
  analyser?: AnalyserNode
  hls: Hls | null
  abortController: AbortController
  track: Track
  cleanupTimer?: ReturnType<typeof setTimeout>
  tempoGlideInterval?: ReturnType<typeof setInterval>
  dropMonitorInterval?: ReturnType<typeof setInterval>
  dropDetected?: boolean
}
