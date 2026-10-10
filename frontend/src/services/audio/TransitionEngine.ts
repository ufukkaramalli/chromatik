import type { AudioChannel } from './types'

export class TransitionEngine {
  /**
   * Calculates the musically optimal phrase duration (in seconds) for smart transitions.
   * Ensures transitions last long enough to fully appreciate beat synchronization and dual-filter morphing:
   * - Compatible BPMs (within ±8%): 6 to 8 bars (11s - 15s) extended club blend.
   * - Moderate BPMs (8% - 15%): 4 to 6 bars (8s - 11s) smooth blend.
   * - Distant BPMs (> 15%): 3.5 to 4 bars (6.5s - 8.5s) ensuring the mix never rushes.
   */
  public static getMusicalCrossfadeDuration(
    crossfadeSetting: number,
    trackDuration: number,
    bpmA?: number,
    bpmB?: number
  ): number {
    if (crossfadeSetting <= 0) return 0

    const effectiveBpmA = bpmA && bpmA >= 50 && bpmA <= 220 ? bpmA : 120
    const barDuration = (60 / effectiveBpmA) * 4

    // Dynamic Tempo-Distance Strategy
    if (bpmA && bpmB && bpmA >= 50 && bpmA <= 220 && bpmB >= 50 && bpmB <= 220) {
      let ratio = bpmB / bpmA
      if (ratio > 1.7 && ratio < 2.3) ratio /= 2
      else if (ratio > 0.4 && ratio < 0.6) ratio *= 2

      const diffPercent = Math.abs(ratio - 1)

      // Distant tempo gap (> 14%): 3.5 - 4 bars (typically 7.0s - 8.5s)
      if (diffPercent > 0.14) {
        const phraseDuration = Math.min(8.5, Math.max(6.5, barDuration * 3.5))
        return Number(phraseDuration.toFixed(2))
      }

      // Moderate tempo difference (8% - 14%): 4 - 5 bars (typically 8.5s - 11s)
      if (diffPercent > 0.08) {
        const numBars = trackDuration < 90 ? 4 : 5
        const phraseDuration = Math.min(11.0, Math.max(8.0, numBars * barDuration))
        return Number(phraseDuration.toFixed(2))
      }
    }

    // Compatible BPMs (within ±8%) or default: Full 6 - 8 bar DJ blend (11s - 15s)
    let numBars = 8
    if (trackDuration < 60) {
      numBars = 3
    } else if (trackDuration < 90) {
      numBars = 5
    } else if (trackDuration < 130) {
      numBars = 6
    } else {
      numBars = 8
    }

    let phraseDuration = numBars * barDuration
    const maxAllowed = Math.min(15.0, trackDuration * 0.20)
    phraseDuration = Math.min(phraseDuration, maxAllowed)

    const minFloor = trackDuration < 60 ? 4.5 : 8.5
    return Math.max(minFloor, Number(phraseDuration.toFixed(2)))
  }

  /**
   * Evaluates tempo compatibility between outgoing and incoming tracks and returns
   * synchronized playback rates (within club DJ ±10% range) and glide return flag.
   */
  public static calculateBpmAlignment(
    bpmA?: number,
    bpmB?: number,
    basePlaybackRate = 1
  ): {
    outgoingPlaybackRate?: number
    initialIncomingRate: number
    shouldGlideBackTempo: boolean
  } {
    let initialIncomingRate = basePlaybackRate
    let outgoingPlaybackRate: number | undefined
    let shouldGlideBackTempo = false

    const a = Number(bpmA)
    const b = Number(bpmB)

    if (a > 50 && b > 50 && a < 220 && b < 220) {
      let targetBpmA = a
      let targetBpmB = b

      // Half-time / Double-time normalization
      if (targetBpmB / targetBpmA > 1.7 && targetBpmB / targetBpmA < 2.3) {
        targetBpmA *= 2
      } else if (targetBpmA / targetBpmB > 1.7 && targetBpmA / targetBpmB < 2.3) {
        targetBpmB *= 2
      }

      const ratio = targetBpmB / targetBpmA
      // Club DJ standard ±9.5% pitch range (e.g. 120-132 BPM)
      if (ratio >= 0.905 && ratio <= 1.105) {
        const commonBpm = (targetBpmA + targetBpmB) / 2
        const rateA = (commonBpm / targetBpmA) * basePlaybackRate
        outgoingPlaybackRate = Math.max(0.6, Math.min(1.8, rateA))

        const rateB = (commonBpm / targetBpmB) * basePlaybackRate
        initialIncomingRate = Math.max(0.6, Math.min(1.8, rateB))
        shouldGlideBackTempo = true
      }
    }

    return {
      outgoingPlaybackRate,
      initialIncomingRate,
      shouldGlideBackTempo
    }
  }

  /**
   * Generates high-resolution DJ Blend Overlap Curves (128 points).
   * Maintains constant energetic presence through the mix midpoint.
   */
  public static generateDJBlendCurves(curveLength = 128): {
    fadeInCurve: Float32Array
    fadeOutCurve: Float32Array
  } {
    const fadeInCurve = new Float32Array(curveLength)
    const fadeOutCurve = new Float32Array(curveLength)

    for (let i = 0; i < curveLength; i++) {
      const t = i / (curveLength - 1)
      fadeInCurve[i] = Math.sin(Math.pow(t, 0.75) * 0.5 * Math.PI)
      fadeOutCurve[i] = Math.cos(Math.pow(t, 1.35) * 0.5 * Math.PI)
    }

    return { fadeInCurve, fadeOutCurve }
  }

  /**
   * Smoothly interpolates playback rate from current value to target value over durationMs
   */
  public static glidePlaybackRate(
    channel: AudioChannel,
    targetRate: number,
    durationMs: number
  ): void {
    if (channel.tempoGlideInterval) {
      clearInterval(channel.tempoGlideInterval)
      channel.tempoGlideInterval = undefined
    }

    const startRate = channel.audio.playbackRate
    const diff = targetRate - startRate
    if (Math.abs(diff) < 0.01) {
      channel.audio.playbackRate = targetRate
      return
    }

    const steps = 25
    const intervalMs = Math.max(16, Math.floor(durationMs / steps))
    let currentStep = 0

    channel.tempoGlideInterval = setInterval(() => {
      currentStep++
      const progress = Math.min(1, currentStep / steps)
      // Ease in-out smoothing
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
      channel.audio.playbackRate = Number((startRate + diff * eased).toFixed(3))

      if (progress >= 1) {
        if (channel.tempoGlideInterval) clearInterval(channel.tempoGlideInterval)
        channel.tempoGlideInterval = undefined
        channel.audio.playbackRate = targetRate
      }
    }, intervalMs)
  }
}
