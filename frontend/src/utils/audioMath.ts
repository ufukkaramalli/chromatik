export const CHROMATIC_NOTES = [
  'C',
  'C# / Db',
  'D',
  'D# / Eb',
  'E',
  'F',
  'F# / Gb',
  'G',
  'G# / Ab',
  'A',
  'A# / Bb',
  'B'
] as const;

/** Allowed pitch shift range in semitones (shared by engine + UI) */
export const PITCH_MIN_SEMITONES = -12;
export const PITCH_MAX_SEMITONES = 12;

export function clampPitch(semitones: number): number {
  return Math.max(PITCH_MIN_SEMITONES, Math.min(PITCH_MAX_SEMITONES, Math.round(semitones)));
}

/**
 * Loudness normalization. Streaming services target -14 (Spotify default / YouTube) to -16 LUFS (Apple);
 * a beat store wants club-level playback, so every track is levelled to -9 LUFS.
 */
export const NORMALIZATION_TARGET_LUFS = -9;
/** Quiet masters are boosted at most this much (the limiter catches the resulting peaks) */
export const MAX_NORMALIZATION_BOOST_DB = 8;
/** Brickwall limiter ceiling after normalization (sample peak, leaves ~1 dB inter-sample headroom) */
export const LIMITER_CEILING_DB = -1;

export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Gain (dB) that brings a track from its integrated loudness to the target.
 * Loud tracks are attenuated freely, quiet ones are boosted up to MAX_NORMALIZATION_BOOST_DB.
 * Returns null when the track hasn't been analysed (play it untouched).
 */
export function computeNormalizationGainDb(
  integratedLufs: number | null | undefined,
  targetLufs = NORMALIZATION_TARGET_LUFS,
  maxBoostDb = MAX_NORMALIZATION_BOOST_DB
): number | null {
  if (typeof integratedLufs !== 'number' || !Number.isFinite(integratedLufs)) return null;
  return Math.min(maxBoostDb, targetLufs - integratedLufs);
}

/** "+3.2 dB", "-1.5 dB", "0.0 dB" */
export function formatGainDb(db: number): string {
  const rounded = Math.round(db * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)} dB`;
}

/**
 * Transpose a canonical musical key (e.g. "D# / Eb Min") by a number of semitones.
 */
export function transposeKey(key: string | null | undefined, semitones: number): string | null {
  if (!key) return null;
  if (semitones === 0) return key;

  // Key format is typically "<Note> <Maj|Min>", e.g. "C# / Db Min", "G Maj", "EbMin", etc.
  const trimmed = key.trim();
  const match = trimmed.match(/^(.*?)\s+(Maj|Min)$/i);
  if (!match) return key;

  const root = match[1].trim().toLowerCase();
  const type = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();

  // Find index in CHROMATIC_NOTES (checking various spellings)
  const index = CHROMATIC_NOTES.findIndex((note) => {
    const parts = note.toLowerCase().split('/').map((s) => s.trim());
    return parts.includes(root) || note.toLowerCase() === root;
  });

  if (index === -1) return key;

  const newIndex = ((index + (semitones % 12) + 12) % 12);
  return `${CHROMATIC_NOTES[newIndex]} ${type}`;
}

/**
 * Calculate effective BPM from original track BPM and current playback rate.
 */
export function calculateEffectiveBpm(bpm: number | null | undefined, rate: number): number | null {
  if (!bpm || isNaN(bpm)) return null;
  return Math.round(bpm * rate);
}

/**
 * Format semitones offset nicely: "+2 st", "-1 st", "0 st"
 */
export function formatPitchLabel(semitones: number): string {
  if (semitones === 0) return '0 st';
  return semitones > 0 ? `+${semitones} st` : `${semitones} st`;
}

/**
 * Format playback rate nicely: "1.00x", "1.15x"
 */
export function formatSpeedLabel(rate: number): string {
  return `${rate.toFixed(2)}x`;
}
