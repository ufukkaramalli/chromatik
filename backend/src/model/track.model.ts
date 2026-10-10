import { Schema, model } from "mongoose";
import ITrack, { TRACK_KEYS } from '.././interfaces/track.interface';
//@ts-ignore
import slug from 'mongoose-slug-generator'
import mongoose from 'mongoose'

mongoose.plugin(slug)

/**
 * @openapi
 * components:
 *   schemas:
 *     Track:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the track
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         art:
 *           type: string
 *         status:
 *           type: string
 *           enum: [draft, private, public]
 *         views:
 *           type: number
 *         likes:
 *           type: number
 *         url:
 *           type: string
 *         taggedAudioUrl:
 *           type: string
 *         untaggedAudioUrl:
 *           type: string
 *         stemsUrl:
 *           type: string
 *         loudness:
 *           type: object
 *           description: EBU R128 loudness of the streamed audio, used by the player for loudness normalization. Absent until the track is analysed.
 *           properties:
 *             integrated:
 *               type: number
 *               description: Integrated loudness in LUFS
 *               example: -10.3
 *             truePeak:
 *               type: number
 *               description: True peak in dBTP
 *               example: -0.8
 *             measuredAt:
 *               type: string
 *               format: date-time
 *         bpm:
 *           type: number
 *         key:
 *           type: string
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         moods:
 *           type: array
 *           items:
 *             type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         priceBasic:
 *           type: number
 *         pricePremium:
 *           type: number
 *         priceUnlimited:
 *           type: number
 *         priceExclusive:
 *           type: number
 *         slug:
 *           type: string
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
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
        likes:{
            type:Number,
            default: 0
        },
        likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        url:{
            type:String,
            required: true,
        },
        taggedAudioUrl: { type: String },
        untaggedAudioUrl: { type: String },
        stemsUrl: { type: String },
        loudness: {
            type: new Schema(
                {
                    integrated: { type: Number, required: true },
                    truePeak: { type: Number, required: true },
                    measuredAt: { type: Date, default: Date.now }
                },
                { _id: false }
            ),
            default: undefined
        },
        bpm: { type: Number },
        key: {
            type: String,
            enum: {
                values: [...TRACK_KEYS, null, ''],
                message: '{VALUE} is not a valid track key'
            },
            default: null
        },
        genres: [{ type: String }],
        moods: [{ type: String }],
        tags: [{ type: String }],
        priceBasic: { type: Number },
        pricePremium: { type: Number },
        priceUnlimited: { type: Number },
        priceExclusive: { type: Number },
        slug:{
            type:String,
            slug:"name",
            unique:true
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