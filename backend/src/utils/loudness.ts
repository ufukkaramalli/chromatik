import { spawn } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';

/** EBU R128 / ITU-R BS.1770 loudness measurement of a track's playback file */
export interface LoudnessInfo {
    /** Integrated loudness (LUFS) */
    integrated: number;
    /** True peak (dBTP) */
    truePeak: number;
    measuredAt: Date;
}

/** Audio watermark mixed over untagged uploads (streamed via HLS) */
export const TAG_PATH = path.join(__dirname, '../assets/tag-padded.wav');

/**
 * Filter graph that mixes the looping tag over the untagged beat.
 * Input 0 = untagged audio, input 1 = tag (looped with -stream_loop -1).
 * Shared by the HLS encoder and the loudness analyser so both always hear the same mix.
 */
export const TAG_MIX_FILTER =
    '[1:a]volume=0.8[tag];[0:a][tag]amix=inputs=2:duration=first:dropout_transition=2:normalize=0';

/** Anything at or below this is digital silence (ebur128 floors integrated loudness at -70 LUFS) */
const SILENCE_LUFS = -70;
const MEASURE_TIMEOUT_MS = 5 * 60 * 1000;

const parseDb = (raw: string | undefined): number | null => {
    if (!raw) return null;
    if (/-inf/i.test(raw)) return -Infinity;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
};

/** Parses the summary block printed by ffmpeg's ebur128 filter */
export function parseEbur128Summary(stderr: string): Omit<LoudnessInfo, 'measuredAt'> | null {
    const summaryStart = stderr.lastIndexOf('Integrated loudness:');
    if (summaryStart === -1) return null;
    const summary = stderr.slice(summaryStart);

    const integrated = parseDb(summary.match(/I:\s+(-?inf|-?[\d.]+)\s+LUFS/i)?.[1]);
    const truePeak = parseDb(summary.match(/Peak:\s+(-?inf|-?[\d.]+)\s+dBFS/i)?.[1]);
    if (integrated === null || truePeak === null) return null;

    return {
        integrated: Math.max(SILENCE_LUFS, integrated),
        truePeak: Number.isFinite(truePeak) ? truePeak : SILENCE_LUFS
    };
}

function runEbur128(args: string[]): Promise<LoudnessInfo | null> {
    return new Promise(resolve => {
        if (!ffmpegStatic) return resolve(null);

        const proc = spawn(ffmpegStatic as string, ['-hide_banner', '-nostats', ...args]);
        let stderr = '';
        const timer = setTimeout(() => proc.kill('SIGKILL'), MEASURE_TIMEOUT_MS);

        proc.stderr.on('data', chunk => {
            stderr += chunk.toString();
            // Only the trailing summary matters: keep memory bounded on long files
            if (stderr.length > 64 * 1024) stderr = stderr.slice(-32 * 1024);
        });
        proc.on('error', err => {
            clearTimeout(timer);
            console.error('[loudness] ffmpeg failed to start:', err);
            resolve(null);
        });
        proc.on('close', code => {
            clearTimeout(timer);
            const parsed = code === 0 ? parseEbur128Summary(stderr) : null;
            if (!parsed) console.error(`[loudness] measurement failed (exit ${code}): ${stderr.slice(-500)}`);
            resolve(parsed ? { ...parsed, measuredAt: new Date() } : null);
        });
    });
}

const EBUR128 = 'ebur128=peak=true:framelog=quiet';

/**
 * Measures a local audio file (wav / mp3 / m4a / flac ...).
 * NOTE: the bundled static ffmpeg crashes when demuxing MPEG-TS (HLS segments) and when
 * resolving remote hosts, so HLS tracks must be measured from their source via measureTaggedMixLoudness.
 * Never throws: returns null if the file can't be analysed.
 */
export function measureFileLoudness(filePath: string): Promise<LoudnessInfo | null> {
    return runEbur128(['-i', filePath, '-vn', '-af', EBUR128, '-f', 'null', '-']);
}

/** Measures the exact "untagged beat + looping tag" mix that gets encoded into the HLS stream */
export function measureTaggedMixLoudness(untaggedPath: string, tagPath = TAG_PATH): Promise<LoudnessInfo | null> {
    return runEbur128([
        '-i', untaggedPath,
        '-stream_loop', '-1', '-i', tagPath,
        '-filter_complex', `${TAG_MIX_FILTER},${EBUR128}`,
        '-vn', '-f', 'null', '-'
    ]);
}
