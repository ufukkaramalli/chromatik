import { Document, Types } from 'mongoose'

export default interface ISoundkit extends Document {
    title: string;
    description: string;
    thumbnailUrl: string;
    views: number;
    url:string;
    demoAudioUrl?: string;
    downloadUrl?: string;
    price?: number;
    status: string;
    userId: Types.ObjectId
}