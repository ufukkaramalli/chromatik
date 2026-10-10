import { PitchShifter } from './PitchShifter'
import { Limiter } from './Limiter'
import { dbToGain, LIMITER_CEILING_DB } from '@/utils/audioMath'

export class MasterChain {
  public context: AudioContext | null = null
  public gainNode: GainNode | null = null
  public analyserNode: AnalyserNode | null = null
  public pitchShifter: PitchShifter | null = null
  public normGain: GainNode | null = null
  public limiter: Limiter | null = null

  public init(initialVolume = 1, initialPitchSemitones = 0): AnalyserNode | null {
    if (this.context) return this.analyserNode

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      // 'playback' = larger output buffers: fewer underruns/crackles on mobile
      this.context = new AudioCtx({ latencyHint: 'playback' })

      this.gainNode = this.context.createGain()
      this.gainNode.gain.value = initialVolume

      this.analyserNode = this.context.createAnalyser()
      this.analyserNode.fftSize = 512

      // Initialize real-time pitch shifter
      this.pitchShifter = new PitchShifter(this.context)
      this.pitchShifter.setSemitones(initialPitchSemitones)
      if (import.meta.env.DEV) {
        ;(window as any).__pitchShifter = this.pitchShifter
      }

      // Loudness normalization: gain stage + brickwall limiter
      this.normGain = this.context.createGain()
      this.limiter = new Limiter(this.context)
      this.applyNormalization(null, 0)

      // Audio Graph:
      // Source -> NormGain -> PitchShifter -> Limiter -> Analyser -> Gain (volume / fades) -> Destination
      this.normGain.connect(this.pitchShifter.input)
      this.pitchShifter.output.connect(this.limiter.input)
      this.limiter.output.connect(this.analyserNode)
      this.analyserNode.connect(this.gainNode)
      this.gainNode.connect(this.context.destination)

      return this.analyserNode
    } catch (e) {
      console.error('[MasterChain] Web Audio API not supported', e)
      throw e
    }
  }

  public async initOrResume(initialVolume = 1, initialPitchSemitones = 0): Promise<AnalyserNode | null> {
    const analyser = this.init(initialVolume, initialPitchSemitones)
    if (this.context?.state === 'suspended') {
      await this.context.resume()
    }
    const pending = [this.pitchShifter?.ready, this.limiter?.ready].filter(Boolean)
    if (pending.length) {
      await Promise.race([
        Promise.all(pending),
        new Promise(resolve => setTimeout(resolve, 2000))
      ])
    }
    return analyser
  }

  public setVolume(volume: number): void {
    if (this.gainNode && this.context) {
      this.gainNode.gain.setTargetAtTime(volume, this.context.currentTime, 0.01)
    }
  }

  public setPitchSemitones(semitones: number): void {
    if (this.pitchShifter) {
      this.pitchShifter.setSemitones(semitones)
    }
  }

  public applyNormalization(gainDb: number | null, rampSeconds: number): void {
    if (this.normGain && this.context) {
      const target = dbToGain(gainDb ?? 0)
      const param = this.normGain.gain
      const now = this.context.currentTime
      param.cancelScheduledValues(now)
      if (rampSeconds > 0) {
        param.setTargetAtTime(target, now, rampSeconds / 3)
      } else {
        param.setValueAtTime(target, now)
      }
    }
    this.limiter?.setCeilingDb(gainDb === null ? 0 : LIMITER_CEILING_DB)
  }

  public get inputNode(): AudioNode | null {
    return this.normGain || this.pitchShifter?.input || this.analyserNode
  }

  public destroy(): void {
    this.pitchShifter?.destroy()
    this.pitchShifter = null
    this.limiter?.destroy()
    this.limiter = null
    this.normGain?.disconnect()
    this.normGain = null
    this.gainNode?.disconnect()
    this.gainNode = null
    this.analyserNode?.disconnect()
    this.analyserNode = null
    if (this.context && this.context.state !== 'closed') {
      this.context.close()
    }
    this.context = null
  }
}
