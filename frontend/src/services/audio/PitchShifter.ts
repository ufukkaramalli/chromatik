import type { StretchNode } from 'signalsmith-stretch'

/** Time constant for dry/wet crossfades (setTargetAtTime) */
const XFADE_TC = 0.015
/** After ~6 time constants a setTargetAtTime fade is effectively complete */
const XFADE_SETTLE = XFADE_TC * 6
/** Extra margin after the stretch latency before fading the wet path in (flushes stale buffers) */
const WET_WARMUP_MARGIN = 0.05

export interface PitchShifterTuning {
  /** STFT block length. Shorter = tighter transients (drums), longer = better frequency resolution (bass/pads) */
  blockMs: number
  /** Hop between blocks. Smaller = more overlap = smoother, more CPU */
  intervalMs: number
  /** Above this frequency content is treated as non-tonal (less metallic hats/sibilance when lower) */
  tonalityHz: number
  /** Preserve spectral envelope (vocal timbre) while shifting pitch */
  formantCompensation: boolean
  /** Rough fundamental for formant analysis, 0 = auto-detect */
  formantBaseHz: number
  /** Spread STFT work evenly across render quanta (avoids CPU spikes / crackles, +1 interval latency) */
  splitComputation: boolean
}

/**
 * Library preset is 120 ms / 30 ms. A shorter block with 5x overlap keeps drum hits and
 * vocal consonants tighter (less smearing / phasiness) at a modest CPU cost.
 */
export const DEFAULT_PITCH_TUNING: PitchShifterTuning = {
  blockMs: 80,
  intervalMs: 16,
  tonalityHz: 8000,
  formantCompensation: false,
  formantBaseHz: 0,
  splitComputation: true
}

/** Lighter profile for phones / low-end machines: ~45% less STFT work per second */
export const LOW_POWER_PITCH_TUNING: Partial<PitchShifterTuning> = {
  blockMs: 110,
  intervalMs: 28
}

/** Heuristic: mobile, <= 4 CPU cores or <= 4 GB RAM (deviceMemory is Chromium-only) */
export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & {
    deviceMemory?: number
    userAgentData?: { mobile?: boolean }
  }
  const cores = nav.hardwareConcurrency || 8
  const memoryGb = nav.deviceMemory ?? 8
  const mobile = nav.userAgentData?.mobile ?? /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent)
  return mobile || cores <= 4 || memoryGb <= 4
}

/**
 * Real-time, phase-coherent pitch shifter built on Signalsmith Stretch (WASM / AudioWorklet).
 *
 * Graph:
 *   input ─┬─> dryDelay ─> dryGain ─┬─> output
 *          └─> stretch  ─> wetGain ─┘
 *
 * - At 0 semitones the stretch node is stopped (no CPU cost) and the dry path is a
 *   bit-perfect, sample-aligned delayed copy of the input.
 * - The dry path is delayed by exactly the stretch latency so dry <-> wet crossfades
 *   stay on the same timeline (no stutter / skipped audio when toggling pitch).
 * - If AudioWorklet / WASM is unavailable, the shifter silently stays in dry bypass.
 */
export class PitchShifter {
  private context: AudioContext
  public input: GainNode
  public output: GainNode

  private dryDelay: DelayNode
  private dryGain: GainNode
  private wetGain: GainNode

  private stretch: StretchNode | null = null
  private latency = 0
  private tuning: PitchShifterTuning = {
    ...DEFAULT_PITCH_TUNING,
    ...(isLowPowerDevice() ? LOW_POWER_PITCH_TUNING : {})
  }

  private _semitones = 0
  private wetActive = false
  private destroyed = false

  /** Resolves to true once the stretch node is ready, false if unsupported / failed */
  public readonly ready: Promise<boolean>

  constructor(context: AudioContext) {
    this.context = context

    this.input = context.createGain()
    this.output = context.createGain()

    this.dryDelay = context.createDelay(1)
    this.dryDelay.delayTime.value = 0

    this.dryGain = context.createGain()
    this.wetGain = context.createGain()
    this.dryGain.gain.value = 1
    this.wetGain.gain.value = 0

    this.input.connect(this.dryDelay)
    this.dryDelay.connect(this.dryGain)
    this.dryGain.connect(this.output)
    this.wetGain.connect(this.output)

    this.ready = this.initStretch()
  }

  private async initStretch(): Promise<boolean> {
    if (!this.context.audioWorklet) {
      console.warn('[PitchShifter] AudioWorklet not available (insecure context?), pitch shifting disabled')
      return false
    }

    try {
      // Lazy-load: keeps the ~110 KB WASM bundle out of the main chunk
      const { default: SignalsmithStretch } = await import('signalsmith-stretch')
      const node = await SignalsmithStretch(this.context, {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        channelCount: 2,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers'
      })

      if (this.destroyed) {
        node.disconnect()
        return false
      }

      // Apply STFT settings first: they determine the latency
      await node.configure(this.stretchConfig())

      // Align the dry path to the stretch latency (rounded to whole samples => bit-perfect delay)
      await this.updateLatency(node)
      this.input.connect(node)
      node.connect(this.wetGain)
      this.stretch = node

      // Apply any value that was set before the node was ready
      this.apply(this._semitones)
      return true
    } catch (e) {
      console.warn('[PitchShifter] Failed to initialise Signalsmith Stretch, pitch shifting disabled:', e)
      return false
    }
  }

  private async updateLatency(node: StretchNode): Promise<void> {
    const sampleRate = this.context.sampleRate
    const latency = await node.latency()
    this.latency = Math.min(0.9, Math.max(0, Math.round(latency * sampleRate) / sampleRate))
    this.dryDelay.delayTime.value = this.latency
  }

  /** STFT layout settings (changing these resets the stretch state and latency) */
  private stretchConfig() {
    return {
      blockMs: this.tuning.blockMs,
      intervalMs: this.tuning.intervalMs,
      splitComputation: this.tuning.splitComputation
    }
  }

  /** Pitch / timbre params sent with every schedule() call */
  private shiftParams(semitones: number) {
    return {
      semitones,
      tonalityHz: this.tuning.tonalityHz,
      formantCompensation: this.tuning.formantCompensation,
      formantBaseHz: this.tuning.formantBaseHz
    }
  }

  /**
   * Live-adjust quality settings (useful for A/B listening).
   * Changing blockMs / intervalMs resets the internal STFT state (brief glitch).
   */
  public async tune(partial: Partial<PitchShifterTuning>): Promise<PitchShifterTuning> {
    const prev = this.tuning
    this.tuning = { ...prev, ...partial }
    const stretch = this.stretch
    if (!stretch) return this.tuning

    const layoutChanged =
      this.tuning.blockMs !== prev.blockMs ||
      this.tuning.intervalMs !== prev.intervalMs ||
      this.tuning.splitComputation !== prev.splitComputation
    if (layoutChanged) {
      await stretch.configure(this.stretchConfig())
      await this.updateLatency(stretch)
    }
    if (this.wetActive) {
      await stretch.schedule({ output: this.context.currentTime, ...this.shiftParams(this._semitones) })
    }
    return this.tuning
  }

  public getTuning(): PitchShifterTuning & { latencyMs: number } {
    return { ...this.tuning, latencyMs: Math.round(this.latency * 1000) }
  }

  public setSemitones(semitones: number): void {
    this._semitones = semitones
    this.apply(semitones)
  }

  private apply(semitones: number): void {
    const stretch = this.stretch
    if (!stretch || this.destroyed) return

    const now = this.context.currentTime
    const dry = this.dryGain.gain
    const wet = this.wetGain.gain

    // Bypass: fade back to the pristine dry path, then stop processing to save CPU
    if (Math.abs(semitones) < 0.01) {
      if (!this.wetActive) return
      this.wetActive = false

      dry.cancelScheduledValues(now)
      wet.cancelScheduledValues(now)
      dry.setTargetAtTime(1, now, XFADE_TC)
      wet.setTargetAtTime(0, now, XFADE_TC)

      // schedule() times are *output* (heard) times: the stop takes effect on the input side
      // once the wet fade has finished, while the node's latency tail keeps feeding the fade
      stretch.stop(now + this.latency + XFADE_SETTLE).catch(() => {})
      return
    }

    if (this.wetActive) {
      // Already processing: just glide to the new pitch
      stretch.schedule({ output: now, ...this.shiftParams(semitones) }).catch(() => {})
      return
    }

    // Activate: start processing (also cancels any pending stop), wait until the
    // node's output reflects current input, then crossfade dry -> wet
    this.wetActive = true
    stretch.schedule({ output: now, active: true, ...this.shiftParams(semitones) }).catch(() => {})

    const fadeAt = now + this.latency + WET_WARMUP_MARGIN
    dry.cancelScheduledValues(now)
    wet.cancelScheduledValues(now)
    dry.setTargetAtTime(0, fadeAt, XFADE_TC)
    wet.setTargetAtTime(1, fadeAt, XFADE_TC)
  }

  public get semitones(): number {
    return this._semitones
  }

  public destroy(): void {
    this.destroyed = true
    try {
      this.stretch?.stop().catch(() => {})
      this.stretch?.disconnect()
    } catch {}
    this.stretch = null

    this.input.disconnect()
    this.dryDelay.disconnect()
    this.dryGain.disconnect()
    this.wetGain.disconnect()
    this.output.disconnect()
    this.wetActive = false
  }
}
