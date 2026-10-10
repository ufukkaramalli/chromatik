/**
 * One-time silence trimming & stream migration script:
 * Detects and trims leading/trailing dead silence on physical audio files stored on disk.
 * If the track uses an HLS stream, regenerates the stream segments from the trimmed audio
 * and updates EBU R128 loudness in MongoDB.
 *
 * Usage:
 *   npm run silence:trim                  # Trims silence and updates HLS/loudness
 *   npm run silence:trim -- --dry-run     # Detects and reports silence without modifying files
 *   npm run silence:trim -- --force       # Re-evaluates every track even if already trimmed
 *   npm run silence:trim -- --no-backup   # Skips keeping .orig.bak files
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import TrackModel from '../model/track.model';
import {
    detectSilence,
    trimSilenceFile,
    regenerateHlsStream,
    getAudioDuration
} from '../utils/silence';
import { measureFileLoudness, measureTaggedMixLoudness } from '../utils/loudness';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const MEDIA_ROOT = process.env.MEDIA_DIR || '/srv/chromatik/media';
const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const DRY_RUN = args.has('--dry-run');
const NO_BACKUP = args.has('--no-backup');

const toLocalPath = (url?: string | null): string | null => {
    if (!url || !url.startsWith('/uploads')) return null;
    const absolute = path.join(MEDIA_ROOT, url.replace(/^\/uploads/, ''));
    return fs.existsSync(absolute) ? absolute : null;
};

async function main(): Promise<void> {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) throw new Error(`MONGO_URI is missing (looked in ${envFile})`);

    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGO_URI);

    const tracks = await TrackModel.find({})
        .select('_id name url taggedAudioUrl untaggedAudioUrl loudness')
        .lean();

    console.log(
        `\n[silence-migration] Found ${tracks.length} track(s) in database.` +
            `${FORCE ? ' [FORCE]' : ''}${DRY_RUN ? ' [DRY-RUN]' : ''}\n`
    );

    let trimmedCount = 0;
    let skippedCount = 0;
    let totalSecTrimmed = 0;
    let totalBytesSaved = 0;

    for (const [index, track] of tracks.entries()) {
        const label = `[${index + 1}/${tracks.length}] "${track.name}" (${track._id})`;
        const untaggedPath = toLocalPath(track.untaggedAudioUrl);
        const playbackUrl: string = track.url || track.taggedAudioUrl || '';
        const isHls = playbackUrl.includes('.m3u8');

        if (!untaggedPath) {
            // Check direct tagged audio if untagged audio is not present
            const directTagged = toLocalPath(playbackUrl);
            if (!directTagged) {
                console.log(`${label} -> Skipped (remote or missing local audio: ${playbackUrl})`);
                skippedCount++;
                continue;
            }

            const { leadingSilence, trailingSilence, duration } = await detectSilence(directTagged);
            const totalSilence = leadingSilence + trailingSilence;

            if (totalSilence < 0.1 && !FORCE) {
                console.log(
                    `${label} -> Clean: duration ${duration.toFixed(2)}s (lead: ${leadingSilence}s, tail: ${trailingSilence}s)`
                );
                skippedCount++;
                continue;
            }

            if (DRY_RUN) {
                console.log(
                    `${label} -> [DRY-RUN] Would trim: lead ${leadingSilence}s, tail ${trailingSilence}s (total ${totalSilence.toFixed(2)}s)`
                );
                trimmedCount++;
                totalSecTrimmed += totalSilence;
                continue;
            }

            console.log(
                `${label} -> Trimming direct file: lead ${leadingSilence}s, tail ${trailingSilence}s...`
            );
            const trimRes = await trimSilenceFile(directTagged, { backup: !NO_BACKUP });
            if (trimRes.trimmed) {
                trimmedCount++;
                const secSaved = trimRes.oldDuration - trimRes.newDuration;
                totalSecTrimmed += secSaved;
                totalBytesSaved += trimRes.bytesSaved;
                console.log(
                    `  ✓ Trimmed ${secSaved.toFixed(2)}s (${trimRes.oldDuration.toFixed(2)}s -> ${trimRes.newDuration.toFixed(2)}s), ${(trimRes.bytesSaved / 1024 / 1024).toFixed(2)}MB freed`
                );

                // Re-measure loudness
                const loudness = await measureFileLoudness(directTagged);
                if (loudness) {
                    await TrackModel.updateOne(
                        { _id: track._id },
                        { $set: { loudness } },
                        { timestamps: false }
                    );
                    console.log(
                        `  ✓ Loudness re-measured: ${loudness.integrated.toFixed(1)} LUFS, ${loudness.truePeak.toFixed(1)} dBTP`
                    );
                }
            } else {
                console.log(`  - No significant trim needed (${trimRes.oldDuration.toFixed(2)}s)`);
                skippedCount++;
            }
            continue;
        }

        // We have an untagged master file
        const { leadingSilence, trailingSilence, duration } = await detectSilence(untaggedPath);
        const totalSilence = leadingSilence + trailingSilence;

        if (totalSilence < 0.1 && !FORCE) {
            console.log(
                `${label} -> Clean: duration ${duration.toFixed(2)}s (lead: ${leadingSilence}s, tail: ${trailingSilence}s)`
            );
            skippedCount++;
            continue;
        }

        if (DRY_RUN) {
            console.log(
                `${label} -> [DRY-RUN] Untagged master silence: lead ${leadingSilence}s, tail ${trailingSilence}s (total ${totalSilence.toFixed(2)}s)` +
                    `${isHls ? ' [Will regenerate HLS stream]' : ''}`
            );
            trimmedCount++;
            totalSecTrimmed += totalSilence;
            continue;
        }

        console.log(
            `${label} -> Trimming untagged master (lead ${leadingSilence}s, tail ${trailingSilence}s)...`
        );
        const trimRes = await trimSilenceFile(untaggedPath, { backup: !NO_BACKUP });

        if (trimRes.trimmed || FORCE) {
            const secSaved = trimRes.trimmed ? trimRes.oldDuration - trimRes.newDuration : 0;
            if (trimRes.trimmed) {
                trimmedCount++;
                totalSecTrimmed += secSaved;
                totalBytesSaved += trimRes.bytesSaved;
                console.log(
                    `  ✓ Untagged trimmed: ${secSaved.toFixed(2)}s removed (${trimRes.oldDuration.toFixed(2)}s -> ${trimRes.newDuration.toFixed(2)}s), ${(trimRes.bytesSaved / 1024 / 1024).toFixed(2)}MB freed`
                );
            }

            // Regenerate HLS stream if applicable
            if (isHls) {
                const m3u8Path = toLocalPath(playbackUrl);
                if (m3u8Path) {
                    const streamDir = path.dirname(m3u8Path);
                    console.log(`  ↻ Regenerating HLS stream in ${streamDir}...`);
                    try {
                        await regenerateHlsStream(untaggedPath, streamDir);
                        console.log(`  ✓ HLS stream successfully regenerated.`);

                        // Re-measure loudness for the new mix
                        console.log(`  ↻ Re-measuring EBU R128 loudness...`);
                        const loudness = await measureTaggedMixLoudness(untaggedPath);
                        if (loudness) {
                            await TrackModel.updateOne(
                                { _id: track._id },
                                { $set: { loudness } },
                                { timestamps: false }
                            );
                            console.log(
                                `  ✓ Loudness updated: ${loudness.integrated.toFixed(1)} LUFS, ${loudness.truePeak.toFixed(1)} dBTP`
                            );
                        }
                    } catch (hlsErr: any) {
                        console.error(`  ✗ HLS regeneration error: ${hlsErr.message}`);
                    }
                }
            }
        } else {
            console.log(`  - Already optimal: duration ${trimRes.oldDuration.toFixed(2)}s`);
            skippedCount++;
        }
    }

    console.log(`\n========================================`);
    console.log(`[silence-migration] SUMMARY:`);
    console.log(`  Tracks modified/trimmed: ${trimmedCount}`);
    console.log(`  Tracks clean/skipped:    ${skippedCount}`);
    console.log(`  Total dead air trimmed:  ${totalSecTrimmed.toFixed(2)} seconds`);
    if (!DRY_RUN) {
        console.log(
            `  Disk space saved:        ${(totalBytesSaved / 1024 / 1024).toFixed(2)} MB`
        );
    }
    console.log(`========================================\n`);
}

main()
    .catch(err => {
        console.error('[silence-migration] Fatal error:', err);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
