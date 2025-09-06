import { Schema, model } from "mongoose";
import ITrack from '.././interfaces/track.interface';

const TrackSchema = new Schema(
    {
        name: {
            type:String,
            required: true
        },
        description: {
            type:String
        },
        art:{
            type:String,
            default: 'no-photo.jpg'
        },
        status: {
            type:String,
            enum: ['draft', 'private', 'public'],
            default: 'draft'
        },
        views:{
            type:Number,
            default: 0
        },
        url:{
            type:String,
            required: true,
        },
        slug:{
            type:String
        },
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    },
    { timestamps: true }
)

export default model<ITrack>('Track',TrackSchema)