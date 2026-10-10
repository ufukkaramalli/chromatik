import type { Track } from '@/types/audio'
import type { AudioChannel } from './types'
import Hls from 'hls.js'

export class ChannelManager {
  /**
   * Creates and initializes a new AudioChannel with dual filters, gain, and real-time analyser.
   */
  public static createChannel(params: {
    track: Track
    streamUrl: string
    playbackRate: number
    isCrossfading: boolean
    context: AudioContext | null
    destinationNode: AudioNode | null
  }): AudioChannel {
    const { track, streamUrl, playbackRate, isCrossfading, context, destinationNode } = params

    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.playbackRate = playbackRate
    audio.preservesPitch = true

    let hlsInstance: Hls | null = null
    if (streamUrl.includes('.m3u8') && Hls.isSupported()) {
      hlsInstance = new Hls()
      hlsInstance.loadSource(streamUrl)
      hlsInstance.attachMedia(audio)
    } else {
      audio.src = streamUrl
    }

    const abortController = new AbortController()
    let source: MediaElementAudioSourceNode | null = null
    let lowCutFilter: BiquadFilterNode | null = null
    let hiCutFilter: BiquadFilterNode | null = null
    let fadeGain: GainNode | null = null
    let channelAnalyser: AnalyserNode | null = null

    if (context) {
      source = context.createMediaElementSource(audio)

      // Dual-Filter Morph: Low-Cut (High-Pass) & Hi-Cut (Low-Pass)
      lowCutFilter = context.createBiquadFilter()
      lowCutFilter.type = 'highpass'
      lowCutFilter.Q.setValueAtTime(0.707, context.currentTime)

      hiCutFilter = context.createBiquadFilter()
      hiCutFilter.type = 'lowpass'
      hiCutFilter.Q.setValueAtTime(0.707, context.currentTime)

      // If crossfading into a playing track, start from the common center band (~650Hz / ~1400Hz)
      // Otherwise (fresh playback), filters are completely wide open (20Hz and 20,000Hz)
      const initialLowCut = isCrossfading ? 650 : 20
      const initialHiCut = isCrossfading ? 1400 : 20000

      lowCutFilter.frequency.setValueAtTime(initialLowCut, context.currentTime)
      hiCutFilter.frequency.setValueAtTime(initialHiCut, context.currentTime)

      fadeGain = context.createGain()
      fadeGain.gain.value = 0.00001
      fadeGain.gain.setValueAtTime(0.00001, context.currentTime)

      // Dedicated real-time channel analyser for drop and outro detection
      channelAnalyser = context.createAnalyser()
      channelAnalyser.fftSize = 256
      channelAnalyser.smoothingTimeConstant = 0.5

      source.connect(lowCutFilter)
      source.connect(channelAnalyser)
      lowCutFilter.connect(hiCutFilter)
      hiCutFilter.connect(fadeGain)

      if (destinationNode) {
        fadeGain.connect(destinationNode)
      }
    }

    return {
      audio,
      source: source!,
      lowCutFilter: lowCutFilter!,
      hiCutFilter: hiCutFilter!,
      fadeGain: fadeGain!,
      analyser: channelAnalyser || undefined,
      hls: hlsInstance,
      abortController,
      track,
      dropDetected: !isCrossfading
    }
  }

  /**
   * Safely ramps down and cleans up an AudioChannel, releasing Web Audio and DOM resources.
   */
  public static cleanupChannel(
    channel: AudioChannel | null,
    context: AudioContext | null,
    activeChannelToRestore?: AudioChannel | null
  ): void {
    if (!channel) return

    if (channel.cleanupTimer) {
      clearTimeout(channel.cleanupTimer)
      channel.cleanupTimer = undefined
    }
    if (channel.tempoGlideInterval) {
      clearInterval(channel.tempoGlideInterval)
      channel.tempoGlideInterval = undefined
    }
    if (channel.dropMonitorInterval) {
      clearInterval(channel.dropMonitorInterval)
      channel.dropMonitorInterval = undefined
    }

    try { channel.abortController.abort() } catch {}
    try { channel.analyser?.disconnect() } catch {}

    const doTeardown = () => {
      if (channel.hls) {
        try { channel.hls.destroy() } catch {}
        channel.hls = null
      }
      try { channel.audio.pause() } catch {}
      channel.audio.removeAttribute('src')
      try { channel.audio.load() } catch {}
      try { channel.source.disconnect() } catch {}
      try { channel.lowCutFilter?.disconnect() } catch {}
      try { channel.hiCutFilter?.disconnect() } catch {}
      try { channel.fadeGain.disconnect() } catch {}
    }

    // Soft 20ms anti-click ramp-down before severance if still audible
    if (context && context.state === 'running') {
      try {
        const now = context.currentTime
        if (channel.fadeGain.gain.value < 0.005) {
          doTeardown()
        } else {
          if (typeof (channel.fadeGain.gain as any).cancelAndHoldAtTime === 'function') {
            (channel.fadeGain.gain as any).cancelAndHoldAtTime(now)
          } else {
            channel.fadeGain.gain.cancelScheduledValues(now)
          }
          channel.fadeGain.gain.setValueAtTime(channel.fadeGain.gain.value, now)
          channel.fadeGain.gain.linearRampToValueAtTime(0.00001, now + 0.02)
          setTimeout(doTeardown, 25)
        }
      } catch {
        doTeardown()
      }
    } else {
      doTeardown()
    }

    // Ensure active channel has full 20Hz-20kHz spectrum restored immediately when outgoing track finishes
    if (activeChannelToRestore && activeChannelToRestore !== channel && context) {
      try {
        const now = context.currentTime
        activeChannelToRestore.lowCutFilter.frequency.cancelScheduledValues(now)
        activeChannelToRestore.lowCutFilter.frequency.setValueAtTime(
          activeChannelToRestore.lowCutFilter.frequency.value,
          now
        )
        activeChannelToRestore.lowCutFilter.frequency.exponentialRampToValueAtTime(20, now + 0.08)

        activeChannelToRestore.hiCutFilter.frequency.cancelScheduledValues(now)
        activeChannelToRestore.hiCutFilter.frequency.setValueAtTime(
          activeChannelToRestore.hiCutFilter.frequency.value,
          now
        )
        activeChannelToRestore.hiCutFilter.frequency.exponentialRampToValueAtTime(20000, now + 0.08)
      } catch {}
    }
  }
}
