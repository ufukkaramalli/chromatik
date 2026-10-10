import { spawn } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { TAG_MIX_FILTER, TAG_PATH } from './loudness';

/**
 * Robust silence trimming filter:
 * - start_periods=1: skips dead silence at the beginning until audio starts
 * - start_duration=0.01 (10ms): ensures transient beat spikes (kicks/snare) trigger instantly
 * - start_threshold=-50dB: cuts digital silence / room noise floor
 * - stop_periods=-1: trims silence from the end of the track
 * - stop_duration=0.5: requires at least 0.5s of continuous silence before cutting to preserve natural decay / reverb tails
 * - stop_threshold=-50dB
 * - detection=peak: sample-accurate peak tracking
 */
export const SILENCE_TRIM_FILTER =
    'silenceremove=start_periods=1:start_duration=0.01:start_threshold=-50dB:detection=peak:stop_periods=-1:stop_duration=0.5:stop_threshold=-50dB';

/**
 * Gets exact duration of an audio file in seconds using ffmpeg banner output.
 */
export function getAudioDuration(filePath: string): Promise<number> {
    return new Promise(resolve => {
        if (!ffmpegStatic || !fs.existsSync(filePath)) return resolve(0);

        const proc = spawn(ffmpegStatic as string, ['-i', filePath, '-f', 'null', '-']);
        let stderr = '';
        proc.stderr.on('data', chunk => {
            stderr += chunk.toString();
        });
        proc.on('close', () => {
            const match = stderr.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/i);
            if (!match) return resolve(0);
            const hours = parseFloat(match[1]) || 0;
            const minutes = parseFloat(match[2]) || 0;
            const seconds = parseFloat(match[3]) || 0;
            resolve(Number((hours * 3600 + minutes * 60 + seconds).toFixed(3)));
        });
        proc.on('error', () => resolve(0));
    });
}

/**
 * Detects leading and trailing silence on an audio file.
 */
export function detectSilence(
    filePath: string,
    thresholdDb = -50
): Promise<{ leadingSilence: number; trailingSilence: number; duration: number }> {
    return new Promise(resolve => {
        if (!ffmpegStatic || !fs.existsSync(filePath)) {
            return resolve({ leadingSilence: 0, trailingSilence: 0, duration: 0 });
        }

        const proc = spawn(ffmpegStatic as string, [
            '-i',
            filePath,
            '-af',
            `silencedetect=noise=${thresholdDb}dB:d=0.08`,
            '-f',
            'null',
            '-'
        ]);

        let stderr = '';
        proc.stderr.on('data', chunk => {
            stderr += chunk.toString();
        });

        proc.on('close', async () => {
            const durMatch = stderr.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/i);
            let duration = 0;
            if (durMatch) {
                duration =
                    (parseFloat(durMatch[1]) || 0) * 3600 +
                    (parseFloat(durMatch[2]) || 0) * 60 +
                    (parseFloat(durMatch[3]) || 0);
            }

            let leadingSilence = 0;
            let trailingSilence = 0;

            const lines = stderr.split('\n');
            const endMatches = lines.filter(l => l.includes('silence_end:'));
            const startMatches = lines.filter(l => l.includes('silence_start:'));

            // If the first silence end happened near the start (within first 5 seconds)
            if (endMatches.length > 0) {
                const firstEnd = endMatches[0].match(/silence_end:\s*([\d.]+)/);
                if (firstEnd) {
                    const endSec = parseFloat(firstEnd[1]);
                    if (endSec <= 5.0) {
                        leadingSilence = endSec;
                    }
                }
            }

            // Check if last silence start continues to duration
            if (startMatches.length > 0 && duration > 0) {
                const lastStartLine = startMatches[startMatches.length - 1];
                const lastStart = lastStartLine.match(/silence_start:\s*([\d.]+)/);
                if (lastStart) {
                    const startSec = parseFloat(lastStart[1]);
                    if (duration - startSec > 0.3) {
                        trailingSilence = Number((duration - startSec).toFixed(3));
                    }
                }
            }

            resolve({
                leadingSilence: Number(leadingSilence.toFixed(3)),
                trailingSilence: Number(trailingSilence.toFixed(3)),
                duration: Number(duration.toFixed(3))
            });
        });

        proc.on('error', () => resolve({ leadingSilence: 0, trailingSilence: 0, duration: 0 }));
    });
}

export interface TrimResult {
    success: boolean;
    trimmed: boolean;
    oldDuration: number;
    newDuration: number;
    bytesSaved: number;
    error?: string;
}

/**
 * Trims silence from an audio file in-place with optional original backup (.orig.bak).
 */
export async function trimSilenceFile(
    filePath: string,
    options: { backup?: boolean; minDiffSec?: number } = {}
): Promise<TrimResult> {
    const { backup = true, minDiffSec = 0.08 } = options;

    if (!ffmpegStatic || !fs.existsSync(filePath)) {
        return {
            success: false,
            trimmed: false,
            oldDuration: 0,
            newDuration: 0,
            bytesSaved: 0,
            error: 'File does not exist or ffmpegStatic unavailable'
        };
    }

    const oldDuration = await getAudioDuration(filePath);
    const oldSize = fs.statSync(filePath).size;

    const tmpFile = `${filePath}.trimmed-${Date.now()}${path.extname(filePath)}`;

    return new Promise(resolve => {
        const proc = spawn(ffmpegStatic as string, [
            '-y',
            '-i',
            filePath,
            '-af',
            SILENCE_TRIM_FILTER,
            tmpFile
        ]);

        let stderr = '';
        proc.stderr.on('data', chunk => {
            stderr += chunk.toString();
        });

        proc.on('error', err => {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
            resolve({
                success: false,
                trimmed: false,
                oldDuration,
                newDuration: oldDuration,
                bytesSaved: 0,
                error: err.message
            });
        });

        proc.on('close', async code => {
            if (code !== 0 || !fs.existsSync(tmpFile)) {
                if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
                return resolve({
                    success: false,
                    trimmed: false,
                    oldDuration,
                    newDuration: oldDuration,
                    bytesSaved: 0,
                    error: `ffmpeg failed with code ${code}: ${stderr.slice(-300)}`
                });
            }

            const newSize = fs.statSync(tmpFile).size;
            // Guard: ensure output file is healthy (> 10KB)
            if (newSize < 10240) {
                fs.unlinkSync(tmpFile);
                return resolve({
                    success: false,
                    trimmed: false,
                    oldDuration,
                    newDuration: oldDuration,
                    bytesSaved: 0,
                    error: 'Trimmed output is unusually small (under 10KB), aborting replacement.'
                });
            }

            const newDuration = await getAudioDuration(tmpFile);
            const diff = oldDuration - newDuration;

            // If trimmed difference is less than threshold (already trimmed)
            if (diff < minDiffSec) {
                fs.unlinkSync(tmpFile);
                return resolve({
                    success: true,
                    trimmed: false,
                    oldDuration,
                    newDuration,
                    bytesSaved: 0
                });
            }

            // Create backup if enabled and not already backed up
            if (backup) {
                const backupPath = `${filePath}.orig.bak`;
                if (!fs.existsSync(backupPath)) {
                    fs.copyFileSync(filePath, backupPath);
                }
            }

            // Atomically replace original with trimmed
            fs.renameSync(tmpFile, filePath);

            resolve({
                success: true,
                trimmed: true,
                oldDuration,
                newDuration,
                bytesSaved: Math.max(0, oldSize - newSize)
            });
        });
    });
}

/**
 * Regenerates an HLS vod stream (m3u8 + aac ts segments) from an untagged master file.
 */
export async function regenerateHlsStream(
    untaggedPath: string,
    streamDir: string,
    tagPath = TAG_PATH
): Promise<void> {
    if (!ffmpegStatic) throw new Error('ffmpegStatic is not available');
    if (!fs.existsSync(untaggedPath)) throw new Error(`Source audio not found: ${untaggedPath}`);
    if (!fs.existsSync(tagPath)) throw new Error(`Tag audio not found: ${tagPath}`);

    // Create temporary staging directory
    const stageDir = path.join(streamDir, `stage-${Date.now()}`);
    fs.mkdirSync(stageDir, { recursive: true });
    const stageM3u8 = path.join(stageDir, 'index.m3u8');

    await new Promise<void>((resolve, reject) => {
        const proc = spawn(ffmpegStatic as string, [
            '-y',
            '-i', untaggedPath,
            '-stream_loop', '-1',
            '-i', tagPath,
            '-filter_complex', TAG_MIX_FILTER,
            '-c:a', 'aac',
            '-b:a', '192k',
            '-hls_time', '10',
            '-hls_playlist_type', 'vod',
            '-f', 'hls',
            stageM3u8
        ]);

        let stderr = '';
        proc.stderr.on('data', chunk => { stderr += chunk.toString(); });
        proc.on('error', reject);
        proc.on('close', code => {
            if (code === 0 && fs.existsSync(stageM3u8)) {
                resolve();
            } else {
                reject(new Error(`HLS generation failed (code ${code}): ${stderr.slice(-300)}`));
            }
        });
    });

    // Move generated stage files into streamDir, replacing previous segments
    const stagedFiles = fs.readdirSync(stageDir);
    // Remove old .ts and .m3u8 in streamDir
    const existing = fs.readdirSync(streamDir);
    for (const f of existing) {
        if (f.endsWith('.ts') || f.endsWith('.m3u8')) {
            fs.unlinkSync(path.join(streamDir, f));
        }
    }

    for (const f of stagedFiles) {
        fs.renameSync(path.join(stageDir, f), path.join(streamDir, f));
    }
    fs.rmdirSync(stageDir);
}
