import { Document, Types } from 'mongoose'

export default interface ISoundkit extends Document {
    title: string;
    description: string;
    thumbnailUrl: string;
    views: number;
    url:string;
    status: string;
    userId: Types.ObjectId
}