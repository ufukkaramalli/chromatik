import { LIMITER_CEILING_DB, dbToGain } from '@/utils/audioMath'

/** Look-ahead window: long enough for transparent attacks on kicks / 808s */
const LOOKAHEAD_MS = 5
/** Release time constant: slow enough to avoid bass distortion, fast enough to avoid pumping */
const RELEASE_MS = 120

/**
 * Stereo-linked look-ahead brickwall limiter (AudioWorklet).
 *
 * Per sample:  required gain = min(1, ceiling / peak)
 *   1. sliding minimum over the look-ahead window   -> never misses a peak
 *   2. instant attack / exponential release          -> smooth recovery
 *   3. moving average over the same window           -> click-free attack ramp
 * Audio is delayed by (window - 1) samples, so the averaged gain is guaranteed to be at
 * or below the required gain when each sample leaves the delay line (no overshoot).
 */
const WORKLET_SOURCE = /* js */ `
class ChromatikLimiter extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'ceiling', defaultValue: 1, minValue: 0.001, maxValue: 1, automationRate: 'k-rate' }]
  }

  constructor(options) {
    super()
    const opts = (options && options.processorOptions) || {}
    this.size = Math.max(2, Math.round(((opts.lookaheadMs || 5) / 1000) * sampleRate))
    this.releaseCoef = Math.exp(-1 / (((opts.releaseMs || 120) / 1000) * sampleRate))
    this.delay = [new Float32Array(this.size), new Float32Array(this.size)]
    this.required = new Float32Array(this.size).fill(1)
    this.smoothed = new Float32Array(this.size).fill(1)
    this.sum = this.size
    this.pos = 0
    this.holdMin = 1
    this.holdAge = 0
    this.release = 1
    this.alive = true
    this.port.onmessage = (e) => { if (e.data === 'dispose') this.alive = false }
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]
    const output = outputs[0]
    const outL = output[0]
    const outR = output[1] || output[0]
    const frames = outL.length
    const inL = input && input[0]
    const inR = input && (input[1] || input[0])
    const ceiling = parameters.ceiling[0]
    const size = this.size
    const delayL = this.delay[0]
    const delayR = this.delay[1]
    const required = this.required
    const smoothed = this.smoothed

    for (let i = 0; i < frames; i++) {
      const l = inL ? inL[i] : 0
      const r = inR ? inR[i] : 0
      const peak = Math.max(Math.abs(l), Math.abs(r))
      const req = peak > ceiling ? ceiling / peak : 1

      const pos = this.pos
      // The oldest sample in the ring is exactly (size - 1) samples old once we overwrite it
      const readPos = (pos + 1) % size
      required[pos] = req

      // 1. Sliding minimum (amortised O(1): rescan only when the held minimum expires)
      if (req <= this.holdMin) {
        this.holdMin = req
        this.holdAge = 0
      } else if (++this.holdAge >= size) {
        let min = 1
        let age = 0
        for (let k = 0; k < size; k++) {
          const idx = (pos - k + size) % size
          if (required[idx] < min) { min = required[idx]; age = k }
        }
        this.holdMin = min
        this.holdAge = age
      }

      // 2. Instant attack, exponential release
      const target = this.holdMin
      this.release = target < this.release ? target : target + (this.release - target) * this.releaseCoef

      // 3. Moving average over the window
      this.sum += this.release - smoothed[pos]
      smoothed[pos] = this.release
      const gain = Math.min(1, this.sum / size)

      // Delay line: write current, read the sample (size - 1) behind
      delayL[pos] = l
      delayR[pos] = r
      outL[i] = delayL[readPos] * gain
      if (outR !== outL) outR[i] = delayR[readPos] * gain

      this.pos = readPos
    }

    // Kill floating-point drift of the running sum once per block
    let exact = 0
    for (let k = 0; k < size; k++) exact += smoothed[k]
    this.sum = exact

    return this.alive
  }
}

registerProcessor('chromatik-limiter', ChromatikLimiter)
`

let moduleUrl: string | null = null
const loadedContexts = new WeakMap<BaseAudioContext, Promise<void>>()

function loadWorkletModule(context: AudioContext): Promise<void> {
  let pending = loadedContexts.get(context)
  if (!pending) {
    moduleUrl ??= URL.createObjectURL(new Blob([WORKLET_SOURCE], { type: 'application/javascript' }))
    pending = context.audioWorklet.addModule(moduleUrl)
    loadedContexts.set(context, pending)
  }
  return pending
}

/**
 * Brickwall limiter stage for the player graph: input -> limiter -> output.
 * Falls back to a hard-knee DynamicsCompressor if AudioWorklet is unavailable.
 */
export class Limiter {
  private context: AudioContext
  public input: GainNode
  public output: GainNode

  private worklet: AudioWorkletNode | null = null
  private fallback: DynamicsCompressorNode | null = null
  private ceilingDb = LIMITER_CEILING_DB
  private destroyed = false

  /** Resolves once the limiter is in the signal path (true = worklet, false = fallback) */
  public readonly ready: Promise<boolean>

  constructor(context: AudioContext) {
    this.context = context
    this.input = context.createGain()
    this.output = context.createGain()
    // Pass-through until the processor is ready
    this.input.connect(this.output)
    this.ready = this.init()
  }

  private async init(): Promise<boolean> {
    try {
      if (!this.context.audioWorklet) throw new Error('AudioWorklet not available')
      await loadWorkletModule(this.context)
      if (this.destroyed) return false

      const node = new AudioWorkletNode(this.context, 'chromatik-limiter', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        channelCount: 2,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers',
        processorOptions: { lookaheadMs: LOOKAHEAD_MS, releaseMs: RELEASE_MS }
      })
      this.worklet = node
      this.applyCeiling()
      this.swapInto(node, node)
      return true
    } catch (e) {
      console.warn('[Limiter] AudioWorklet limiter unavailable, using DynamicsCompressor fallback:', e)
      if (this.destroyed) return false
      const comp = this.context.createDynamicsCompressor()
      comp.knee.value = 0
      comp.ratio.value = 20
      comp.attack.value = 0.001
      comp.release.value = RELEASE_MS / 1000
      this.fallback = comp
      this.applyCeiling()
      this.swapInto(comp, comp)
      return false
    }
  }

  private swapInto(first: AudioNode, last: AudioNode) {
    this.input.disconnect()
    this.input.connect(first)
    last.connect(this.output)
  }

  private applyCeiling() {
    const now = this.context.currentTime
    if (this.worklet) {
      // AudioParamMap is a Map at runtime; the project's DOM lib typings omit its methods
      const params = this.worklet.parameters as unknown as Map<string, AudioParam>
      params.get('ceiling')?.setValueAtTime(dbToGain(this.ceilingDb), now)
    }
    if (this.fallback) {
      this.fallback.threshold.setValueAtTime(this.ceilingDb, now)
    }
  }

  /** Ceiling in dBFS (0 dB = only catches overs, i.e. transparent for untouched masters) */
  public setCeilingDb(db: number) {
    this.ceilingDb = Math.min(0, db)
    this.applyCeiling()
  }

  public destroy() {
    this.destroyed = true
    this.worklet?.port.postMessage('dispose')
    try {
      this.input.disconnect()
      this.worklet?.disconnect()
      this.fallback?.disconnect()
      this.output.disconnect()
    } catch {}
    this.worklet = null
    this.fallback = null
  }
}
