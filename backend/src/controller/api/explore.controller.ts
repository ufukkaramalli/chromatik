import { Request, Response, NextFunction, Router } from 'express';
import IController from '../../interfaces/controller.interface';
import HttpException from '../../utils/exceptions/http.exception';
import ExploreService, {
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    ProducerSort,
    Range,
    SoundkitSort,
    TrackSort
} from '../../service/explore.service';

const TRACK_SORTS: TrackSort[] = ['newest', 'popular', 'liked', 'price_asc', 'price_desc'];
const PRODUCER_SORTS: ProducerSort[] = ['popular', 'newest', 'tracks'];
const SOUNDKIT_SORTS: SoundkitSort[] = ['newest', 'popular', 'price_asc', 'price_desc'];

const MAX_LIST_VALUES = 20;
const MAX_TEXT_LENGTH = 100;

/** Accepts `?genre=a,b` as well as `?genre=a&genre=b`. */
const parseList = (value: unknown): string[] => {
    const raw = Array.isArray(value) ? value : value === undefined ? [] : [value];
    return raw
        .flatMap((v) => String(v).split(','))
        .map((v) => v.trim())
        .filter((v) => v.length > 0 && v.length <= MAX_TEXT_LENGTH)
        .slice(0, MAX_LIST_VALUES);
};

const parseNumber = (value: unknown): number | undefined => {
    if (value === undefined || value === '' || Array.isArray(value)) return undefined;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
};

const parseRange = (min: unknown, max: unknown): Range => ({
    min: parseNumber(min),
    max: parseNumber(max)
});

const parseText = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, MAX_TEXT_LENGTH) : undefined;
};

const parseSort = <T extends string>(value: unknown, allowed: T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;

const parsePagination = (query: any) => {
    const page = Math.max(1, Math.floor(parseNumber(query.page) || 1));
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(parseNumber(query.limit) || DEFAULT_PAGE_SIZE)));
    return { page, limit };
};

class ExploreController implements IController {
    public path = '/explore';
    public router: Router = Router();
    private ExploreService = new ExploreService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.get(`${this.path}/tracks`, this.getTracks);
        this.router.get(`${this.path}/facets`, this.getFacets);
        this.router.get(`${this.path}/producers`, this.getProducers);
        this.router.get(`${this.path}/soundkits`, this.getSoundkits);
    }

    /**
     * @openapi
     * /api/explore/tracks:
     *   get:
     *     tags:
     *       - Explore
     *     summary: List public tracks with filters, sorting and pagination
     *     parameters:
     *       - { in: query, name: q, schema: { type: string }, description: Free text over name, tags, genres, moods }
     *       - { in: query, name: genre, schema: { type: string }, description: Comma separated genres }
     *       - { in: query, name: mood, schema: { type: string }, description: Comma separated moods }
     *       - { in: query, name: key, schema: { type: string } }
     *       - { in: query, name: bpmMin, schema: { type: number } }
     *       - { in: query, name: bpmMax, schema: { type: number } }
     *       - { in: query, name: priceMin, schema: { type: number }, description: Basic license price in USD }
     *       - { in: query, name: priceMax, schema: { type: number }, description: Basic license price in USD }
     *       - { in: query, name: sort, schema: { type: string, enum: [newest, popular, liked, price_asc, price_desc] } }
     *       - { in: query, name: page, schema: { type: integer, default: 1 } }
     *       - { in: query, name: limit, schema: { type: integer, default: 24, maximum: 48 } }
     *     responses:
     *       '200':
     *         description: Paged list of tracks (items, total, page, limit, hasMore)
     *       '500':
     *         description: Internal server error
     */
    private getTracks = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = await this.ExploreService.getTracks({
                q: parseText(req.query.q),
                genres: parseList(req.query.genre),
                moods: parseList(req.query.mood),
                key: parseText(req.query.key),
                bpm: parseRange(req.query.bpmMin, req.query.bpmMax),
                price: parseRange(req.query.priceMin, req.query.priceMax),
                sort: parseSort(req.query.sort, TRACK_SORTS, 'newest'),
                ...parsePagination(req.query)
            });
            return res.status(200).json(data);
        } catch {
            return next(new HttpException(500, 'Failed to fetch tracks'));
        }
    };

    /**
     * @openapi
     * /api/explore/facets:
     *   get:
     *     tags:
     *       - Explore
     *     summary: Available filter options (genres, moods, keys, BPM and price ranges) for public tracks
     *     responses:
     *       '200':
     *         description: Facet data
     *       '500':
     *         description: Internal server error
     */
    private getFacets = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = await this.ExploreService.getFacets();
            return res.status(200).json(data);
        } catch {
            return next(new HttpException(500, 'Failed to fetch facets'));
        }
    };

    /**
     * @openapi
     * /api/explore/producers:
     *   get:
     *     tags:
     *       - Explore
     *     summary: List producers with at least one public track
     *     parameters:
     *       - { in: query, name: sort, schema: { type: string, enum: [popular, newest, tracks] } }
     *       - { in: query, name: page, schema: { type: integer, default: 1 } }
     *       - { in: query, name: limit, schema: { type: integer, default: 24, maximum: 48 } }
     *     responses:
     *       '200':
     *         description: Paged list of producers
     *       '500':
     *         description: Internal server error
     */
    private getProducers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = await this.ExploreService.getProducers({
                q: parseText(req.query.q),
                sort: parseSort(req.query.sort, PRODUCER_SORTS, 'popular'),
                ...parsePagination(req.query)
            });
            return res.status(200).json(data);
        } catch {
            return next(new HttpException(500, 'Failed to fetch producers'));
        }
    };

    /**
     * @openapi
     * /api/explore/soundkits:
     *   get:
     *     tags:
     *       - Explore
     *     summary: List public soundkits
     *     parameters:
     *       - { in: query, name: q, schema: { type: string } }
     *       - { in: query, name: priceMin, schema: { type: number } }
     *       - { in: query, name: priceMax, schema: { type: number } }
     *       - { in: query, name: sort, schema: { type: string, enum: [newest, popular, price_asc, price_desc] } }
     *       - { in: query, name: page, schema: { type: integer, default: 1 } }
     *       - { in: query, name: limit, schema: { type: integer, default: 24, maximum: 48 } }
     *     responses:
     *       '200':
     *         description: Paged list of soundkits
     *       '500':
     *         description: Internal server error
     */
    private getSoundkits = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const data = await this.ExploreService.getSoundkits({
                q: parseText(req.query.q),
                price: parseRange(req.query.priceMin, req.query.priceMax),
                sort: parseSort(req.query.sort, SOUNDKIT_SORTS, 'newest'),
                ...parsePagination(req.query)
            });
            return res.status(200).json(data);
        } catch {
            return next(new HttpException(500, 'Failed to fetch soundkits'));
        }
    };
}

export default ExploreController;
