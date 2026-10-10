declare module 'signalsmith-stretch' {
  export interface StretchSchedule {
    /** AudioContext time at which the change should be heard (latency-compensated) */
    output?: number
    active?: boolean
    input?: number
    rate?: number
    semitones?: number
    tonalityHz?: number
    formantSemitones?: number
    formantCompensation?: boolean
    formantBaseHz?: number
    loopStart?: number
    loopEnd?: number
  }

  export interface StretchConfig {
    blockMs?: number | null
    intervalMs?: number
    splitComputation?: boolean
    preset?: 'default' | 'cheaper'
  }

  export interface StretchNode extends AudioWorkletNode {
    inputTime: number
    schedule(changes: StretchSchedule): Promise<void>
    start(when?: number, ...args: number[]): Promise<void>
    stop(when?: number): Promise<void>
    latency(): Promise<number>
    configure(config: StretchConfig): Promise<void>
    addBuffers(buffers: Float32Array[]): Promise<number>
    dropBuffers(toSeconds?: number): Promise<unknown>
    setUpdateInterval(seconds: number, callback?: (inputTime: number) => void): Promise<void>
  }

  export default function SignalsmithStretch(
    audioContext: BaseAudioContext,
    options?: AudioWorkletNodeOptions
  ): Promise<StretchNode>
}
