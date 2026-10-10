/**
 * One-time loudness backfill: measures EBU R128 loudness for every track that doesn't have it yet.
 *
 *   npm run loudness:backfill               # only tracks without loudness
 *   npm run loudness:backfill -- --force    # re-measure every track
 *   npm run loudness:backfill -- --dry-run  # measure + print, don't write
 *
 * Uses the same .env file selection as the API (NODE_ENV=production -> .env.production).
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import os from 'os';
import path from 'path';
import http from 'http';
import https from 'https';
import TrackModel from '../model/track.model';
import { LoudnessInfo, measureFileLoudness, measureTaggedMixLoudness } from '../utils/loudness';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const MEDIA_ROOT = process.env.MEDIA_DIR || '/srv/chromatik/media';
const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const DRY_RUN = args.has('--dry-run');

const toLocalPath = (url?: string | null): string | null => {
    if (!url || !url.startsWith('/uploads')) return null;
    const absolute = path.join(MEDIA_ROOT, url.replace(/^\/uploads/, ''));
    return fs.existsSync(absolute) ? absolute : null;
};

/** The bundled static ffmpeg can't resolve remote hosts, so remote audio is downloaded first */
function download(url: string, dest: string, redirects = 5): Promise<void> {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, res => {
            const status = res.statusCode || 0;
            if (status >= 300 && status < 400 && res.headers.location && redirects > 0) {
                res.resume();
                const next = new URL(res.headers.location, url).toString();
                download(next, dest, redirects - 1).then(resolve, reject);
                return;
            }
            if (status >= 400) {
                res.resume();
                reject(new Error(`HTTP ${status}`));
                return;
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => file.close(() => resolve()));
            file.on('error', reject);
        });
        req.setTimeout(60_000, () => req.destroy(new Error('Download timed out')));
        req.on('error', reject);
    });
}

async function measureTrack(track: any): Promise<{ loudness: LoudnessInfo | null; source: string }> {
    const playbackUrl: string = track.url || track.taggedAudioUrl || '';

    // HLS stream = untagged beat + looping tag, rebuilt from the source file
    if (playbackUrl.includes('.m3u8')) {
        const untagged = toLocalPath(track.untaggedAudioUrl);
        if (!untagged) return { loudness: null, source: 'hls (untagged source missing)' };
        return { loudness: await measureTaggedMixLoudness(untagged), source: 'hls tag mix' };
    }

    const local = toLocalPath(playbackUrl);
    if (local) return { loudness: await measureFileLoudness(local), source: 'local file' };

    if (/^https?:\/\//i.test(playbackUrl)) {
        const tmp = path.join(os.tmpdir(), `chromatik-loudness-${track._id}${path.extname(new URL(playbackUrl).pathname) || '.audio'}`);
        try {
            await download(playbackUrl, tmp);
            return { loudness: await measureFileLoudness(tmp), source: 'remote file' };
        } catch (err: any) {
            return { loudness: null, source: `remote (download failed: ${err.message})` };
        } finally {
            fs.rmSync(tmp, { force: true });
        }
    }

    return { loudness: null, source: 'no playable source' };
}

async function main(): Promise<void> {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) throw new Error(`MONGO_URI is missing (looked in ${envFile})`);

    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGO_URI);

    const query = FORCE ? {} : { 'loudness.integrated': { $exists: false } };
    const tracks = await TrackModel.find(query)
        .select('_id name url taggedAudioUrl untaggedAudioUrl loudness')
        .lean();

    console.log(`[backfill] ${tracks.length} track(s) to analyse${FORCE ? ' (--force)' : ''}${DRY_RUN ? ' (--dry-run)' : ''}`);

    let ok = 0;
    let failed = 0;
    for (const [index, track] of tracks.entries()) {
        const label = `[${index + 1}/${tracks.length}] ${track.name} (${track._id})`;
        const { loudness, source } = await measureTrack(track);

        if (!loudness) {
            failed++;
            console.warn(`${label} -> skipped: ${source}`);
            continue;
        }

        if (!DRY_RUN) {
            // timestamps: false -> backfilling metadata shouldn't look like a user edit
            await TrackModel.updateOne({ _id: track._id }, { $set: { loudness } }, { timestamps: false });
        }
        ok++;
        console.log(`${label} -> ${loudness.integrated.toFixed(1)} LUFS, ${loudness.truePeak.toFixed(1)} dBTP [${source}]`);
    }

    console.log(`[backfill] done: ${ok} measured, ${failed} skipped`);
}

main()
    .catch(err => {
        console.error('[backfill] failed:', err);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
