import type { AudioChannel } from './types'

export class DropDetector {
  /**
   * Real-time drop & onset detector for incoming channel.
   * Monitors sub-bass frequencies and automatically flips the club bass-swap on the beat drop.
   */
  public static startIntroDropMonitor(
    channel: AudioChannel,
    outgoing: AudioChannel | null,
    context: AudioContext | null,
    isOutgoingActive: (candidate: AudioChannel) => boolean
  ): void {
    if (!channel.analyser || !context) return

    const analyser = channel.analyser
    const freqData = new Uint8Array(analyser.frequencyBinCount)
    const bpm = Number(channel.track?.bpm) || 120
    const barDuration = (60 / bpm) * 4
    // Timeout should never exceed 2.5-3 seconds (max 1 musical bar)
    const maxIntroSeconds = Math.min(3.0, Math.max(1.2, barDuration))

    let rollingBaseline = 20
    let samplesCount = 0

    channel.dropMonitorInterval = setInterval(() => {
      if (!context || channel.audio.paused || channel.audio.ended || channel.dropDetected) {
        if (channel.dropMonitorInterval) {
          clearInterval(channel.dropMonitorInterval)
          channel.dropMonitorInterval = undefined
        }
        return
      }

      analyser.getByteFrequencyData(freqData)
      const subBass = freqData[0]
      const kickPunch = freqData[1]
      const currentBass = (subBass * 1.6 + kickPunch) / 2.6
      const curTime = channel.audio.currentTime

      samplesCount++
      if (samplesCount < 6) {
        rollingBaseline = Math.max(15, (rollingBaseline + currentBass) / 2)
      } else {
        rollingBaseline = rollingBaseline * 0.94 + currentBass * 0.06
      }

      // Detection: kick/808 transient spike OR safety max intro timeout (2-3s)
      const isSpike = currentBass > 52 && currentBass > rollingBaseline * 1.8
      const isTimeout = curTime >= maxIntroSeconds

      if (isSpike || isTimeout) {
        if (channel.dropMonitorInterval) {
          clearInterval(channel.dropMonitorInterval)
          channel.dropMonitorInterval = undefined
        }
        channel.dropDetected = true

        const now = context.currentTime
        // 1. Instantly snap incoming track filters wide open (full bass 20Hz, full treble 20kHz)
        try {
          channel.lowCutFilter.frequency.cancelScheduledValues(now)
          channel.lowCutFilter.frequency.setValueAtTime(channel.lowCutFilter.frequency.value, now)
          channel.lowCutFilter.frequency.exponentialRampToValueAtTime(20, now + 0.06)

          channel.hiCutFilter.frequency.cancelScheduledValues(now)
          channel.hiCutFilter.frequency.setValueAtTime(channel.hiCutFilter.frequency.value, now)
          channel.hiCutFilter.frequency.exponentialRampToValueAtTime(20000, now + 0.06)
        } catch {}

        // 2. Outgoing track: snap low-cut to 800Hz so outgoing bass is completely gone, leaving only mid/hi shimmer
        if (outgoing && isOutgoingActive(outgoing)) {
          try {
            outgoing.lowCutFilter.frequency.cancelScheduledValues(now)
            outgoing.lowCutFilter.frequency.setValueAtTime(outgoing.lowCutFilter.frequency.value, now)
            outgoing.lowCutFilter.frequency.exponentialRampToValueAtTime(800, now + 0.06)
          } catch {}
        }
      }
    }, 50)
  }
}
