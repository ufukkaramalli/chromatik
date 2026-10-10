/**
 * Zero-dependency Client-side BPM Detector
 * Uses Snare-Anchored Metronome Grid with Half-Time Trap Awareness.
 *
 * Why Snare-Anchored?
 * In modern Hip-Hop, Trap, and West Coast beats:
 * - Kicks and 808s are often syncopated (playing 3:2 Tresillo or dotted rhythms), which causes
 *   kick-based detectors to mistakenly report 87-89 BPM instead of 130 BPM!
 * - The Snare / Clap / Rimshot (above 1500 Hz) is the unshakeable anchor of the metronome grid.
 * - In Trap, the snare hits on Beat 3 (Half-Time, 58 - 78 hits/min). The true DAW project tempo
 *   is 2x this snare frequency (e.g. 65 BPM snare -> 130 BPM; 66.75 BPM snare -> 133.5 BPM).
 * - In straight beats (e.g. West Coast), the snare hits on Beats 2 & 4 (> 78 BPM, e.g. 92 BPM).
 */

export interface BpmDetectionResult {
  bpm: number;
  confidence: number;
}

/**
 * Detect BPM from a File, Blob, or ArrayBuffer.
 * Returns the estimated integer/half BPM, or null if detection was impossible.
 */
export async function detectBpmFromAudio(
  source: File | Blob | ArrayBuffer
): Promise<BpmDetectionResult | null> {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    return null;
  }

  let arrayBuffer: ArrayBuffer;
  if (source instanceof ArrayBuffer) {
    arrayBuffer = source.slice(0);
  } else {
    arrayBuffer = await source.arrayBuffer();
  }

  const decodeCtx = new AudioCtx();
  let decoded: AudioBuffer;
  try {
    decoded = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
  } catch (err) {
    console.warn('[BpmDetector] Failed to decode audio data:', err);
    return null;
  } finally {
    if (decodeCtx.state !== 'closed') {
      decodeCtx.close().catch(() => {});
    }
  }

  if (!decoded || decoded.length === 0 || decoded.duration < 2) {
    return null;
  }

  try {
    const sampleRate = decoded.sampleRate;
    // Find 28s window with highest RMS energy to target the beat/drop rather than drumless intros
    let startSec = 0;
    const testDurationSec = 28;
    if (decoded.duration > 35) {
      const ch0 = decoded.getChannelData(0);
      let maxEnergy = 0;
      let bestStart = 15;
      const maxScan = Math.min(decoded.duration - testDurationSec, decoded.duration * 0.65);
      for (let sec = 10; sec <= maxScan; sec += 5) {
        const startIdx = Math.floor(sec * sampleRate);
        const endIdx = startIdx + Math.floor(testDurationSec * sampleRate);
        let sum = 0;
        const stride = 50;
        for (let i = startIdx; i < endIdx; i += stride) {
          sum += ch0[i] * ch0[i];
        }
        if (sum > maxEnergy) {
          maxEnergy = sum;
          bestStart = sec;
        }
      }
      startSec = bestStart;
    }

    const durationSec = Math.min(testDurationSec, decoded.duration - startSec);
    const startSample = Math.floor(startSec * sampleRate);
    const lengthSamples = Math.floor(durationSec * sampleRate);

    // 1. Downmix slice to mono
    const mono = new Float32Array(lengthSamples);
    const ch0 = decoded.getChannelData(0);
    const ch1 = decoded.numberOfChannels > 1 ? decoded.getChannelData(1) : null;

    if (ch1) {
      for (let i = 0; i < lengthSamples; i++) {
        mono[i] = (ch0[startSample + i] + ch1[startSample + i]) * 0.5;
      }
    } else {
      mono.set(ch0.subarray(startSample, startSample + lengthSamples));
    }

    // 2. Highpass filter above 1500 Hz to isolate snares, claps, and hi-hats
    const dt = 1 / sampleRate;
    const rcHigh = 1 / (2 * Math.PI * 1500);
    const alphaHigh = rcHigh / (rcHigh + dt);
    const snareSignal = new Float32Array(lengthSamples);

    let prevHighY = 0;
    let prevHighX = 0;
    for (let i = 0; i < lengthSamples; i++) {
      const y = alphaHigh * (prevHighY + mono[i] - prevHighX);
      prevHighX = mono[i];
      prevHighY = y;
      snareSignal[i] = y;
    }

    // 3. Compute frame-based smoothed RMS envelope & onset flux at 200 Hz
    const fps = 200;
    const hopSize = Math.round(sampleRate / fps);
    const winSize = Math.round(sampleRate * 0.02); // ~20ms window (smooths out 50-70Hz sub-bass ripples)
    const numFrames = Math.floor((lengthSamples - winSize) / hopSize);

    if (numFrames < fps * 4) {
      return null;
    }

    const fluxCombined = new Float32Array(numFrames);
    let prevEnv = 0;

    for (let f = 0; f < numFrames; f++) {
      let sumS = 0;
      let sumF = 0;
      const offset = f * hopSize;
      for (let s = 0; s < winSize; s++) {
        sumS += snareSignal[offset + s] * snareSignal[offset + s];
        sumF += mono[offset + s] * mono[offset + s];
      }
      const env = Math.sqrt(sumF / winSize) + Math.sqrt(sumS / winSize) * 1.5;
      fluxCombined[f] = Math.max(0, env - prevEnv);
      prevEnv = env;
    }

    // 4. Autocorrelation across valid snare/beat range (44 - 200 BPM, covering 88 - 156 project BPM)
    const effectiveFps = sampleRate / hopSize;
    const minLag = Math.floor((60 * effectiveFps) / 200);
    const maxLag = Math.ceil((60 * effectiveFps) / 44);

    const corr = new Float32Array(maxLag + 2);
    for (let lag = minLag; lag <= maxLag; lag++) {
      let sum = 0;
      let normA = 0;
      let normB = 0;
      const limit = numFrames - lag;
      for (let i = 0; i < limit; i++) {
        sum += fluxCombined[i] * fluxCombined[i + lag];
        normA += fluxCombined[i] * fluxCombined[i];
        normB += fluxCombined[i + lag] * fluxCombined[i + lag];
      }
      corr[lag] = normA && normB ? sum / Math.sqrt(normA * normB) : 0;
    }

    // 5. Find prominent peaks in autocorrelation with parabolic refinement
    const peaks: { lag: number; bpm: number; corr: number }[] = [];
    for (let lag = minLag + 1; lag < maxLag; lag++) {
      if (
        corr[lag] > corr[lag - 1] &&
        corr[lag] > corr[lag + 1] &&
        corr[lag] > 0.08
      ) {
        let refinedLag = lag;
        const y0 = corr[lag - 1] || 0;
        const y1 = corr[lag] || 0;
        const y2 = corr[lag + 1] || 0;
        const denom = y0 - 2 * y1 + y2;
        if (denom < 0) {
          const delta = (y0 - y2) / (2 * denom);
          if (Math.abs(delta) < 1) {
            refinedLag = lag + delta;
          }
        }
        const bpm = (60 * effectiveFps) / refinedLag;
        peaks.push({ lag: refinedLag, bpm, corr: corr[lag] });
      }
    }

    if (!peaks.length) {
      return null;
    }

    peaks.sort((a, b) => b.corr - a.corr);
    const top = peaks[0];
    let chosenBpm = top.bpm;

    // Triplet sub-harmonic snare check (e.g. 50.6 BPM triplet -> 76 BPM snare -> 152 BPM in Hood Trap)
    let tripletMatched = false;
    if (top.bpm >= 45 && top.bpm <= 56) {
      const candidateSnare = top.bpm * 1.5;
      const matchSnare = peaks.slice(1).find(p => Math.abs(p.bpm - candidateSnare) <= 2.2 && p.corr >= top.corr * 0.70);
      if (matchSnare) {
        chosenBpm = matchSnare.bpm * 2;
        tripletMatched = true;
      }
    }

    // 6. Half-Time Trap / Hip-Hop rule:
    // If the top peak is between 44 and 78 BPM, the snare is hitting on Beat 3 (Half-Time).
    // The true project DAW grid is 2x this frequency (88 - 156 BPM).
    // Examples:
    // - 46.0 BPM -> 92.0 BPM (Slide By - West Coast)
    // - 64.0 BPM -> 128.0 BPM (Standard House / Pop / Trap)
    // - 66.75 BPM -> 133.5 BPM (My Best)
    // - 71.0 BPM -> 142.0 BPM (Trap / Drill)
    // - 76.0 BPM -> 152.0 BPM (Formula - Hood Trap)
    if (!tripletMatched && top.bpm >= 44 && top.bpm <= 78) {
      chosenBpm = top.bpm * 2;
    }
    // 7. Tresillo 3:2 Syncopation rule:
    // When a track is 123-146 BPM, syncopated dotted rhythms produce a peak in 82 - 97.5 BPM (TrueBPM / 1.5).
    // Check if there is a supporting snare peak at 0.75x or beat peak at 1.5x:
    else if (top.bpm >= 82 && top.bpm <= 97.5) {
      const candidateBpm = top.bpm * 1.5;
      const candidateSnareBpm = candidateBpm / 2;
      const match = peaks.slice(1).find(p => {
        const isCorrStrong = p.corr >= top.corr * 0.45;
        const matchesSnare = Math.abs(p.bpm - candidateSnareBpm) <= 2.5;
        const matchesBeat = Math.abs(p.bpm - candidateBpm) <= 3.0;
        return isCorrStrong && (matchesSnare || matchesBeat);
      });
      if (match) {
        chosenBpm = candidateBpm;
      }
    }

    const finalBpm = Math.round(chosenBpm * 2) / 2;
    const confidence = Math.min(1, Math.max(0, top.corr));

    return {
      bpm: finalBpm,
      confidence
    };
  } catch (error) {
    console.error('[BpmDetector] Error during detection:', error);
    return null;
  }
}
