import { PipelineStage } from 'mongoose';
import TrackModel from '.././model/track.model';
import SoundkitModel from '.././model/soundkit.model';
import UserModel from '.././model/user.model';
import { TRACK_KEYS } from '.././interfaces/track.interface';

export const MAX_PAGE_SIZE = 48;
export const DEFAULT_PAGE_SIZE = 24;

/** Fields that must never leak through public listings (paid deliverables). */
const TRACK_PRIVATE_FIELDS = '-untaggedAudioUrl -stemsUrl';
const SOUNDKIT_PRIVATE_FIELDS = '-downloadUrl -url';
const PUBLIC_USER_FIELDS = 'name slug photoUrl profileTheme';

export type TrackSort = 'newest' | 'popular' | 'liked' | 'price_asc' | 'price_desc';
export type ProducerSort = 'popular' | 'newest' | 'tracks';
export type SoundkitSort = 'newest' | 'popular' | 'price_asc' | 'price_desc';

export interface Range {
    min?: number;
    max?: number;
}

export interface Pagination {
    page: number;
    limit: number;
}

export interface TrackQuery extends Pagination {
    q?: string;
    genres: string[];
    moods: string[];
    key?: string;
    bpm: Range;
    price: Range;
    sort: TrackSort;
}

export interface ProducerQuery extends Pagination {
    q?: string;
    sort: ProducerSort;
}

export interface SoundkitQuery extends Pagination {
    q?: string;
    price: Range;
    sort: SoundkitSort;
}

export interface PagedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive exact matchers treating spaces and hyphens interchangeably (e.g. "Hip-Hop" matches "Hip Hop"). */
const exactMatchers = (values: string[]) =>
    values.map((v) => {
        const pattern = escapeRegex(v.trim()).replace(/[-_ ]+/g, '[-_ ]+');
        return new RegExp(`^\\s*${pattern}\\s*$`, 'i');
    });

const applyRange = (filter: any, field: string, range: Range) => {
    const condition: any = {};
    if (typeof range.min === 'number') condition.$gte = range.min;
    if (typeof range.max === 'number') condition.$lte = range.max;
    if (Object.keys(condition).length) filter[field] = condition;
};

/** Shape a populated document the way existing frontend components expect it. */
const withUser = (doc: any) => ({
    ...doc,
    id: doc._id,
    user: doc.userId,
    userId: doc.userId?._id
});

const paged = <T>(items: T[], total: number, { page, limit }: Pagination): PagedResult<T> => ({
    items,
    total,
    page,
    limit,
    hasMore: page * limit < total
});

const TRACK_SORTS: Record<TrackSort, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    popular: { views: -1, createdAt: -1 },
    liked: { likes: -1, createdAt: -1 },
    price_asc: { priceBasic: 1, createdAt: -1 },
    price_desc: { priceBasic: -1, createdAt: -1 }
};

const SOUNDKIT_SORTS: Record<SoundkitSort, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    popular: { views: -1, createdAt: -1 },
    price_asc: { price: 1, createdAt: -1 },
    price_desc: { price: -1, createdAt: -1 }
};

const PRODUCER_SORTS: Record<ProducerSort, Record<string, 1 | -1>> = {
    popular: { totalPlays: -1, totalLikes: -1 },
    newest: { latestAt: -1 },
    tracks: { trackCount: -1, totalPlays: -1 }
};

class ExploreService {
    /**
     * Public tracks with genre / mood / key / BPM / price filters.
     */
    public async getTracks(query: TrackQuery): Promise<PagedResult<any>> {
        const filter: any = { status: 'public' };

        if (query.genres.length) filter.genres = { $in: exactMatchers(query.genres) };
        if (query.moods.length) filter.moods = { $in: exactMatchers(query.moods) };
        if (query.key && (TRACK_KEYS as readonly string[]).includes(query.key)) filter.key = query.key;
        applyRange(filter, 'bpm', query.bpm);
        applyRange(filter, 'priceBasic', query.price);

        // Price sorting only makes sense for priced tracks
        if (query.sort === 'price_asc' || query.sort === 'price_desc') {
            filter.priceBasic = { ...(filter.priceBasic || {}), $gt: 0 };
        }

        if (query.q) {
            const rx = new RegExp(escapeRegex(query.q.trim()), 'i');
            const matchingUsers = await UserModel.find({ name: rx }).select('_id').lean();
            const userIds = matchingUsers.map((u) => u._id);
            const orConditions: any[] = [{ name: rx }, { tags: rx }, { genres: rx }, { moods: rx }];
            if (userIds.length > 0) {
                orConditions.push({ userId: { $in: userIds } });
            }
            filter.$or = orConditions;
        }

        const [items, total] = await Promise.all([
            TrackModel.find(filter)
                .select(TRACK_PRIVATE_FIELDS)
                .sort(TRACK_SORTS[query.sort])
                .skip((query.page - 1) * query.limit)
                .limit(query.limit)
                .populate('userId', PUBLIC_USER_FIELDS)
                .lean(),
            TrackModel.countDocuments(filter)
        ]);

        return paged(items.map(withUser), total, query);
    }

    /**
     * Filter options derived from currently public tracks.
     */
    public async getFacets(): Promise<any> {
        const tagFacet = (field: string): PipelineStage.FacetPipelineStage[] => [
            { $unwind: `$${field}` },
            { $project: { value: { $trim: { input: `$${field}` } } } },
            { $match: { value: { $ne: '' } } },
            { $group: { _id: { $toLower: '$value' }, name: { $first: '$value' }, count: { $sum: 1 } } },
            { $sort: { count: -1, name: 1 } },
            { $limit: 40 },
            { $project: { _id: 0, name: 1, count: 1 } }
        ];

        const [result] = await TrackModel.aggregate([
            { $match: { status: 'public' } },
            {
                $facet: {
                    genres: tagFacet('genres'),
                    moods: tagFacet('moods'),
                    keys: [
                        { $match: { key: { $nin: [null, ''] } } },
                        { $group: { _id: '$key', count: { $sum: 1 } } },
                        { $sort: { _id: 1 } },
                        { $project: { _id: 0, name: '$_id', count: 1 } }
                    ],
                    ranges: [
                        {
                            $group: {
                                _id: null,
                                bpmMin: { $min: '$bpm' },
                                bpmMax: { $max: '$bpm' },
                                priceMin: { $min: { $cond: [{ $gt: ['$priceBasic', 0] }, '$priceBasic', null] } },
                                priceMax: { $max: '$priceBasic' }
                            }
                        }
                    ]
                }
            }
        ]);

        const ranges = result?.ranges?.[0] || {};
        return {
            genres: result?.genres || [],
            moods: result?.moods || [],
            keys: result?.keys || [],
            bpm: { min: ranges.bpmMin ?? null, max: ranges.bpmMax ?? null },
            price: { min: ranges.priceMin ?? null, max: ranges.priceMax ?? null }
        };
    }

    /**
     * Producers that have at least one public track, ranked by engagement.
     */
    public async getProducers(query: ProducerQuery): Promise<PagedResult<any>> {
        const pipeline: any[] = [
            { $match: { status: 'public' } },
            {
                $group: {
                    _id: '$userId',
                    trackCount: { $sum: 1 },
                    totalPlays: { $sum: { $ifNull: ['$views', 0] } },
                    totalLikes: { $sum: { $ifNull: ['$likes', 0] } },
                    latestAt: { $max: '$createdAt' }
                }
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' }
        ];

        if (query.q) {
            const rx = new RegExp(escapeRegex(query.q.trim()), 'i');
            pipeline.push({
                $match: {
                    $or: [
                        { 'user.name': rx },
                        { 'user.slug': rx },
                        { 'user.location': rx },
                        { 'user.bio': rx }
                    ]
                }
            });
        }

        pipeline.push(
            { $sort: PRODUCER_SORTS[query.sort] },
            {
                $facet: {
                    items: [
                        { $skip: (query.page - 1) * query.limit },
                        { $limit: query.limit },
                        {
                            $project: {
                                _id: '$user._id',
                                id: '$user._id',
                                name: '$user.name',
                                slug: '$user.slug',
                                photoUrl: '$user.photoUrl',
                                location: '$user.location',
                                bio: '$user.bio',
                                profileTheme: '$user.profileTheme',
                                trackCount: 1,
                                totalPlays: 1,
                                totalLikes: 1,
                                latestAt: 1
                            }
                        }
                    ],
                    total: [{ $count: 'count' }]
                }
            }
        );

        const [result] = await TrackModel.aggregate(pipeline);

        const total = result?.total?.[0]?.count || 0;
        return paged(result?.items || [], total, query);
    }

    /**
     * Public soundkits.
     */
    public async getSoundkits(query: SoundkitQuery): Promise<PagedResult<any>> {
        const filter: any = { status: 'public' };
        applyRange(filter, 'price', query.price);

        if (query.q) {
            const rx = new RegExp(escapeRegex(query.q.trim()), 'i');
            const matchingUsers = await UserModel.find({ name: rx }).select('_id').lean();
            const userIds = matchingUsers.map((u) => u._id);
            const orConditions: any[] = [{ title: rx }, { description: rx }];
            if (userIds.length > 0) {
                orConditions.push({ userId: { $in: userIds } });
            }
            filter.$or = orConditions;
        }

        if (query.sort === 'price_asc' || query.sort === 'price_desc') {
            filter.price = { ...(filter.price || {}), $gt: 0 };
        }

        const [items, total] = await Promise.all([
            SoundkitModel.find(filter)
                .select(SOUNDKIT_PRIVATE_FIELDS)
                .sort(SOUNDKIT_SORTS[query.sort])
                .skip((query.page - 1) * query.limit)
                .limit(query.limit)
                .populate('userId', PUBLIC_USER_FIELDS)
                .lean(),
            SoundkitModel.countDocuments(filter)
        ]);

        return paged(items.map(withUser), total, query);
    }
}

export default ExploreService;
