import { Router, Request, Response, NextFunction } from 'express';
import https from 'https';
import http from 'http';
import IController from '.././interfaces/controller.interface';
import HttpException from '.././utils/exceptions/http.exception';
import validationMiddleware from '.././middleware/validation.middleware';
import validate from '.././utils/validation/track.validation';
import TrackService from '.././service/track.service';
import authenticated from '.././middleware/authenticated.middleware';
import optionalAuth from '.././middleware/optionalAuth.middleware';
import roleMiddleware from '.././middleware/role.middleware';
import { upload } from '../utils/upload';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { TAG_MIX_FILTER, TAG_PATH, measureFileLoudness, measureTaggedMixLoudness } from '../utils/loudness';
import { trimSilenceFile } from '../utils/silence';

const MEDIA_DIR = process.env.MEDIA_DIR || '/srv/chromatik/media';

ffmpeg.setFfmpegPath(ffmpegStatic as string);

class TrackController implements IController {
    public path = '/track';
    public router: Router = Router();
    private TrackService = new TrackService();

    constructor(){
        this.initialiseRoutes()
    }

    private initialiseRoutes(): void {

        /** Public listing routes (no auth required) */
        this.router.get(`${this.path}/stats`, this.getStats)
        this.router.get(`${this.path}/recent`, this.getRecent)
        this.router.get(`${this.path}/mostlike`, this.getMostLiked)
        this.router.get(`${this.path}/moststreamed`, this.getMostStreamed)
        this.router.get(`${this.path}/proxy-stream`, this.proxyStream)
        this.router.post(`${this.path}/find-track`, this.findTrack)
        this.router.post(`${this.path}/play-increase`, optionalAuth, this.playIncrease)
        this.router.post(`${this.path}/:id/like`, authenticated, this.toggleLike)

        /** Dashboard route */
        this.router.get(`${this.path}/dashboard`, authenticated, roleMiddleware, this.getDashboardTracks);
        this.router.delete(`${this.path}/:id`, authenticated, roleMiddleware, this.deleteTrack);

        /** Track Create Route */
        this.router.post(
            `${this.path}`,
            [
                authenticated,
                roleMiddleware,
                upload.fields([
                    { name: 'art', maxCount: 1 },
                    { name: 'taggedAudio', maxCount: 1 },
                    { name: 'untaggedAudio', maxCount: 1 },
                    { name: 'stems', maxCount: 1 }
                ])
            ],
            this.create
        )
    }
    /**
     * @openapi
     * /api/track:
     *   post:
     *     tags:
     *       - Track
     *     summary: Create a new track
     *     description: Uploads the track files. The streamed audio (tagged file or generated HLS tag mix) is analysed with EBU R128 and its `loudness` is stored for player-side normalization; analysis failures never block the upload.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               art:
     *                 type: string
     *                 format: binary
     *               taggedAudio:
     *                 type: string
     *                 format: binary
     *               untaggedAudio:
     *                 type: string
     *                 format: binary
     *               stems:
     *                 type: string
     *                 format: binary
     *     responses:
     *       '201':
     *         description: Track created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 track:
     *                   $ref: '#/components/schemas/Track'
     *       '400':
     *         description: Bad Request
     *       '401':
     *         description: Unauthorized
     */
    private create = async (
        req:Request,
        res:Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const data: any = { ...req.body, userId: (req as any).user._id };
            delete data.loudness; // server-measured only, never trust the client

            data.url = ''; // Default for compatibility
            
            const getRelativeUrl = (absolutePath: string) => {
                return '/uploads' + absolutePath.replace(MEDIA_DIR, '');
            };

            if (files?.['art']) data.art = getRelativeUrl(files['art'][0].path);
            if (files?.['taggedAudio']) {
                const taggedPath = files['taggedAudio'][0].path;
                try {
                    await trimSilenceFile(taggedPath, { backup: false });
                } catch (trimErr) {
                    console.warn('[upload] Silence trimming skipped for taggedAudio:', trimErr);
                }
                data.taggedAudioUrl = getRelativeUrl(taggedPath);
                data.url = data.taggedAudioUrl; // Fallback for player
                const loudness = await measureFileLoudness(taggedPath);
                if (loudness) data.loudness = loudness;
            } else if (files?.['untaggedAudio']) {
                const untaggedPath = files['untaggedAudio'][0].path;
                try {
                    await trimSilenceFile(untaggedPath, { backup: false });
                } catch (trimErr) {
                    console.warn('[upload] Silence trimming skipped for untaggedAudio:', trimErr);
                }

                const streamId = `stream-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const userId = (req as any).user?._id || 'anonymous';
                const year = new Date().getFullYear();
                
                const streamDir = path.join(MEDIA_DIR, String(userId), String(year), 'streams', streamId);
                fs.mkdirSync(streamDir, { recursive: true });
                
                const m3u8Path = path.join(streamDir, 'index.m3u8');
                const tagPath = TAG_PATH;
                
                await new Promise((resolve, reject) => {
                    ffmpeg(untaggedPath)
                        .input(tagPath)
                        // Loop the tag infinitely
                        .inputOptions(['-stream_loop', '-1'])
                        // Mix them together: duration=first means it stops when the main track stops
                        // volume=0.8 for the tag so it cuts through but isn't deafening
                        .complexFilter([TAG_MIX_FILTER])
                        .audioCodec('aac')
                        .audioBitrate('192k')
                        .outputOptions([
                            '-hls_time 10',
                            '-hls_playlist_type vod',
                            '-f hls'
                        ])
                        .on('end', () => resolve(true))
                        .on('error', (err) => reject(err))
                        .save(m3u8Path);
                });

                data.taggedAudioUrl = getRelativeUrl(m3u8Path);
                data.url = data.taggedAudioUrl;

                // Analyse the same mix that was streamed (the bundled ffmpeg can't demux the HLS segments)
                const loudness = await measureTaggedMixLoudness(untaggedPath, tagPath);
                if (loudness) data.loudness = loudness;
            }
            if (files?.['untaggedAudio']) data.untaggedAudioUrl = getRelativeUrl(files['untaggedAudio'][0].path);
            if (files?.['stems']) data.stemsUrl = getRelativeUrl(files['stems'][0].path);

            // Convert stringified numbers back to numbers
            const numFields = ['bpm', 'priceBasic', 'pricePremium', 'priceUnlimited', 'priceExclusive'];
            numFields.forEach(f => {
                if (data[f]) data[f] = Number(data[f]);
            });

            // Convert stringified array fields if necessary (sometimes formData sends arrays as comma separated)
            if (typeof data.genres === 'string') data.genres = data.genres.split(',').map((s:string) => s.trim());
            if (typeof data.moods === 'string') data.moods = data.moods.split(',').map((s:string) => s.trim());
            if (!data.key || (typeof data.key === 'string' && data.key.trim() === '')) {
                data.key = null;
            }

            const track = await this.TrackService.create(data)
            res.status(201).json({ track });
        } catch (error:any) {
            console.error(error);
            next(new HttpException(400, 'Cannot create track'))
        }
    }

    /**
     * @openapi
     * /api/track/{id}:
     *   delete:
     *     tags:
     *       - Track
     *     summary: Delete a track by ID
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Track ID
     *     responses:
     *       '200':
     *         description: Track deleted successfully
     *       '403':
     *         description: Unauthorized
     *       '404':
     *         description: Track not found
     */
    private deleteTrack = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const trackId = req.params.id;
            const userId = (req as any).user._id;
            
            const track: any = await this.TrackService.findById(trackId);
            if (!track) return next(new HttpException(404, 'Track not found'));
            if (String(track.userId) !== String(userId)) return next(new HttpException(403, 'Unauthorized'));

            const deleteFile = (url: string | undefined) => {
                if (!url || !url.startsWith('/uploads')) return;
                const absolutePath = path.join(MEDIA_DIR, url.replace('/uploads', ''));
                if (fs.existsSync(absolutePath)) {
                    if (fs.lstatSync(absolutePath).isDirectory()) {
                        fs.rmSync(absolutePath, { recursive: true, force: true });
                    } else {
                        fs.unlinkSync(absolutePath);
                    }
                }
            };

            deleteFile(track.art);
            deleteFile(track.untaggedAudioUrl);
            deleteFile(track.stemsUrl);
            
            if (track.taggedAudioUrl && track.taggedAudioUrl.includes('/streams/')) {
                const streamDirUrl = track.taggedAudioUrl.substring(0, track.taggedAudioUrl.lastIndexOf('/'));
                deleteFile(streamDirUrl);
            } else {
                deleteFile(track.taggedAudioUrl);
            }

            await this.TrackService.delete(trackId);
            res.status(200).json({ message: 'Track deleted successfully' });
        } catch (error: any) {
            next(new HttpException(500, 'Cannot delete track'));
        }
    }

    /**
     * @openapi
     * /api/track/dashboard:
     *   get:
     *     tags:
     *       - Track
     *     summary: Get dashboard tracks for current user
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Returns user tracks
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 tracks:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Track'
     *       '401':
     *         description: Unauthorized
     */
    private getDashboardTracks = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const tracks = await this.TrackService.getDashboardTracks((req as any).user._id);
            res.status(200).json({ tracks });
        } catch (error: any) {
            next(new HttpException(500, 'Cannot fetch dashboard tracks'))
        }
    }

    /**
     * @openapi
     * /api/track/stats:
     *   get:
     *     tags:
     *       - Track
     *     summary: Get platform track and producer counts
     *     description: Returns the total count of producers and published tracks in the database
     *     responses:
     *       '200':
     *         description: Platform statistics fetched successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 producersCount:
     *                   type: number
     *                   example: 6
     *                 tracksCount:
     *                   type: number
     *                   example: 7
     *                 producers:
     *                   type: number
     *                   example: 6
     *                 tracks:
     *                   type: number
     *                   example: 7
     *       '500':
     *         description: Cannot fetch platform stats
     */
    private getStats = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const stats = await this.TrackService.getStats();
            res.status(200).json({
                ...stats,
                producers: stats.producersCount,
                tracks: stats.tracksCount
            });
        } catch (error: any) {
            next(new HttpException(500, 'Cannot fetch platform stats'));
        }
    }

    /**
     * @openapi
     * /api/track/recent:
     *   get:
     *     tags:
     *       - Track
     *     summary: Get recent tracks
     *     responses:
     *       '200':
     *         description: Returns recent public tracks
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 tracks:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Track'
     */
    private getRecent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const tracks = await this.TrackService.getRecent();
            // Transform userId populate to "user" key for frontend compatibility
            const formatted = tracks.map((t: any) => ({
                ...t,
                id: t._id,
                user: t.userId,
                userId: t.userId?._id
            }));
            res.status(200).json({ tracks: formatted });
        } catch (error: any) {
            next(new HttpException(500, 'Cannot fetch recent tracks'))
        }
    }

    /**
     * @openapi
     * /api/track/mostlike:
     *   get:
     *     tags:
     *       - Track
     *     summary: Get most liked tracks
     *     responses:
     *       '200':
     *         description: Returns most liked public tracks
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 MostLiked:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Track'
     */
    private getMostLiked = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const tracks = await this.TrackService.getMostLiked();
            const formatted = tracks.map((t: any) => ({
                ...t,
                id: t._id,
                user: t.userId,
                userId: t.userId?._id
            }));
            res.status(200).json({ MostLiked: formatted });
        } catch (error: any) {
            next(new HttpException(500, 'Cannot fetch most liked tracks'))
        }
    }

    /**
     * @openapi
     * /api/track/moststreamed:
     *   get:
     *     tags:
     *       - Track
     *     summary: Get most streamed tracks
     *     responses:
     *       '200':
     *         description: Returns most streamed public tracks
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 MostStreamed:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Track'
     */
    private getMostStreamed = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const tracks = await this.TrackService.getMostStreamed();
            const formatted = tracks.map((t: any) => ({
                ...t,
                id: t._id,
                user: t.userId,
                userId: t.userId?._id
            }));
            res.status(200).json({ MostStreamed: formatted });
        } catch (error: any) {
            next(new HttpException(500, 'Cannot fetch most streamed tracks'))
        }
    }

    /**
     * @openapi
     * /api/track/find-track:
     *   post:
     *     tags:
     *       - Track
     *     summary: Find a specific track by user and track slug
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               data:
     *                 type: object
     *                 properties:
     *                   userSlug:
     *                     type: string
     *                   trackSlug:
     *                     type: string
     *     responses:
     *       '200':
     *         description: Returns the requested track
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Track'
     *       '404':
     *         description: Track not found
     */
    private findTrack = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { userSlug, trackSlug } = req.body.data;
            const track = await this.TrackService.findTrackBySlug(userSlug, trackSlug);
            
            if (!track) {
                return next(new HttpException(404, 'Track not found'));
            }

            // Format for frontend
            const formatted = {
                ...track,
                id: (track as any)._id,
                user: track.userId,
                userId: (track.userId as any)?._id
            };

            res.status(200).json(formatted);
        } catch (error: any) {
            next(new HttpException(500, 'Error finding track'))
        }
    }

    /**
     * @openapi
     * /api/track/play-increase:
     *   post:
     *     tags:
     *       - Track
     *     summary: Increment play/view count for a track
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: string
     *                 description: Track ID
     *     responses:
     *       '204':
     *         description: Successfully incremented
     */
    private playIncrease = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { id } = req.body;
            const userId = (req as any).user?._id?.toString();
            if (id) await this.TrackService.playIncrease(id, userId);
            res.status(204).send();
        } catch (error: any) {
            res.status(204).send(); // fire-and-forget, never fail the client
        }
    }

    /**
     * @openapi
     * /api/track/{id}/like:
     *   post:
     *     tags:
     *       - Track
     *     summary: Toggle like for a track
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The track id
     *     responses:
     *       200:
     *         description: Returns updated like status
     *       400:
     *         description: Bad Request (e.g., trying to like own track)
     *       401:
     *         description: Unauthorized
     */
    private toggleLike = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { id } = req.params;
            const userId = (req as any).user._id.toString();
            const result = await this.TrackService.toggleLike(id, userId);
            res.status(200).json(result);
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    }

    /**
     * @openapi
     * /api/track/proxy-stream:
     *   get:
     *     tags:
     *       - Track
     *     summary: Proxy an external audio stream to bypass CORS
     *     parameters:
     *       - in: query
     *         name: url
     *         required: true
     *         schema:
     *           type: string
     *         description: URL of the audio stream
     *     responses:
     *       '200':
     *         description: Stream content
     *       '400':
     *         description: URL is required
     */
    private proxyStream = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const streamUrl = req.query.url as string;

        if (!streamUrl) {
            res.status(400).send('URL is required');
            return;
        }

        try {
            const client = streamUrl.startsWith('https') ? https : http;
            
            client.get(streamUrl, (proxyRes) => {
                // Check if the request was successful
                if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
                    res.status(proxyRes.statusCode).send('Source returned an error');
                    return;
                }

                // Transfer headers
                res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'audio/mpeg');
                if (proxyRes.headers['content-length']) {
                    res.setHeader('Content-Length', proxyRes.headers['content-length']);
                }
                res.setHeader('Cache-Control', 'public, max-age=3600');

                // Pipe the response
                proxyRes.pipe(res);
            }).on('error', (err) => {
                console.error('[ProxyStream] Error:', err);
                if (!res.headersSent) {
                    res.status(500).send('Error fetching stream');
                }
            });
        } catch (error: any) {
            next(new HttpException(500, 'Error processing proxy request'));
        }
    }
}

export default TrackController