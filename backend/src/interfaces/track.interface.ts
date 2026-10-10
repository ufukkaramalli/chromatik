import { Document, Types } from 'mongoose'

export const TRACK_KEYS = [
    'C Maj', 'C Min',
    'C# / Db Maj', 'C# / Db Min',
    'D Maj', 'D Min',
    'D# / Eb Maj', 'D# / Eb Min',
    'E Maj', 'E Min',
    'F Maj', 'F Min',
    'F# / Gb Maj', 'F# / Gb Min',
    'G Maj', 'G Min',
    'G# / Ab Maj', 'G# / Ab Min',
    'A Maj', 'A Min',
    'A# / Bb Maj', 'A# / Bb Min',
    'B Maj', 'B Min'
] as const;

export type TrackKey = typeof TRACK_KEYS[number];

export default interface ITrack extends Document{
    name: string,
    description: string,
    art:string,
    status: string,
    views:number,
    likes:number,
    likedBy?: Types.ObjectId[],
    url:string,
    taggedAudioUrl?: string,
    untaggedAudioUrl?: string,
    stemsUrl?: string,
    /** EBU R128 loudness of the streamed audio (used for player-side normalization) */
    loudness?: {
        integrated: number,
        truePeak: number,
        measuredAt?: Date
    },
    bpm?: number,
    key?: TrackKey | string | null,
    genres?: string[],
    moods?: string[],
    tags?: string[],
    priceBasic?: number,
    pricePremium?: number,
    priceUnlimited?: number,
    priceExclusive?: number,
    slug:string,
    userId: Types.ObjectId
}