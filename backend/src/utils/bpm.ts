import { spawn } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';

/**
 * Extracts raw mono PCM float audio from an audio file using ffmpeg.
 */
export async function extractRawPcm(
    filePath: string,
    startSec = 8,
    durationSec = 30,
    sampleRate = 22050
): Promise<Float32Array | null> {
    return new Promise(resolve => {
        if (!ffmpegStatic) return resolve(null);

        const proc = spawn(ffmpegStatic as string, [
            '-hide_banner',
            '-loglevel',
            'error',
            '-ss',
            String(startSec),
            '-t',
            String(durationSec),
            '-i',
            filePath,
            '-f',
            'f32le',
            '-ac',
            '1',
            '-ar',
            String(sampleRate),
            'pipe:1'
        ]);

        const chunks: Buffer[] = [];
        proc.stdout.on('data', chunk => chunks.push(chunk));
        proc.on('error', err => {
            console.error('[bpm] ffmpeg spawn error:', err);
            resolve(null);
        });
        proc.on('close', code => {
            if (code !== 0 || chunks.length === 0) {
                // If seeking to startSec failed (e.g. short audio), retry from 0s
                if (startSec > 0) {
                    return resolve(extractRawPcm(filePath, 0, durationSec, sampleRate));
                }
                return resolve(null);
            }
            const fullBuffer = Buffer.concat(chunks as any);
            const floatArray = new Float32Array(
                fullBuffer.buffer,
                fullBuffer.byteOffset,
                Math.floor(fullBuffer.byteLength / 4)
            );
            resolve(floatArray);
        });
    });
}

/**
 * Detects BPM with Snare-Anchored Metronome Grid and Half-Time Awareness.
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
export function detectBpmFromPcm(pcm: Float32Array, sampleRate = 22050): number | null {
    const numSamples = pcm.length;
    if (!numSamples) return null;

    const fps = 200;
    const hopSize = Math.round(sampleRate / fps);
    const winSize = Math.round(sampleRate * 0.02); // ~20ms window (smooths out 50-70Hz sub-bass ripples)
    const numFrames = Math.floor((numSamples - winSize) / hopSize);

    if (numFrames < fps * 4) return null;

    // Highpass filter above 1500 Hz to isolate snares, claps, and hi-hats
    const dt = 1 / sampleRate;
    const rcHigh = 1 / (2 * Math.PI * 1500);
    const alphaHigh = rcHigh / (rcHigh + dt);
    const snarePcm = new Float32Array(numSamples);
    let prevHighY = 0;
    let prevHighX = 0;
    for (let i = 0; i < numSamples; i++) {
        const y = alphaHigh * (prevHighY + pcm[i] - prevHighX);
        prevHighX = pcm[i];
        prevHighY = y;
        snarePcm[i] = y;
    }

    // Compute smoothed dual-band onset flux
    const fluxCombined = new Float32Array(numFrames);
    let prevEnv = 0;
    for (let f = 0; f < numFrames; f++) {
        let sumS = 0;
        let sumF = 0;
        const off = f * hopSize;
        for (let s = 0; s < winSize; s++) {
            sumS += snarePcm[off + s] * snarePcm[off + s];
            sumF += pcm[off + s] * pcm[off + s];
        }
        const env = Math.sqrt(sumF / winSize) + Math.sqrt(sumS / winSize) * 1.5;
        fluxCombined[f] = Math.max(0, env - prevEnv);
        prevEnv = env;
    }

    const effectiveFps = sampleRate / hopSize;
    // Search from 44 BPM (half-time of 88) up to 200 BPM
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

    // Find prominent peaks in autocorrelation with parabolic refinement
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

    if (!peaks.length) return null;

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

    // Half-Time Trap / Hip-Hop rule:
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
    // Tresillo 3:2 Syncopation rule:
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

    // Round to nearest 0.5 step (supporting 133.5, 92, 100, 130, 128, 142, etc.)
    return Math.round(chosenBpm * 2) / 2;
}

/**
 * Measures BPM of an audio file on disk.
 */
export async function measureFileBpm(filePath: string): Promise<number | null> {
    const pcm = await extractRawPcm(filePath);
    if (!pcm) return null;
    return detectBpmFromPcm(pcm);
}
