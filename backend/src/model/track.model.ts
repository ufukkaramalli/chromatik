import mongoose, { Schema, model } from 'mongoose';
import ITrack from '.././interfaces/track.interface';

/**
 * @openapi
 * components:
 *   schemas:
 *     createTrackInput:
 *       type: object
 *       required:
 *         - name
 *         - url
 *         - userId
 *       properties:
 *         name:
 *           type: string
 *           example: "My First Track"
 *         description:
 *           type: string
 *           example: "This is a demo track"
 *         art:
 *           type: string
 *           example: "cover.png"
 *         status:
 *           type: string
 *           example: "draft"
 *         url:
 *           type: string
 *           example: "https://cdn.chromatik.com/tracks/my-first-track.mp3"
 *         userId:
 *           type: string
 *           example: "68bc256a54c0705e8e2d0c26"
 *
 *     Track:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65bc256a54c0705e8e2d0a99"
 *         name:
 *           type: string
 *           example: "My First Track"
 *         description:
 *           type: string
 *           example: "This is a demo track"
 *         art:
 *           type: string
 *           example: "cover.png"
 *         status:
 *           type: string
 *           example: "published"
 *         url:
 *           type: string
 *           example: "https://cdn.chromatik.com/tracks/my-first-track.mp3"
 *         userId:
 *           type: string
 *           example: "68bc256a54c0705e8e2d0c26"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-10T12:13:30.973Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-09-10T12:13:30.973Z"
 *         id:
 *           type: string
 *           example: "65bc256a54c0705e8e2d0a99"
 */

const TrackSchema = new Schema<ITrack>(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    art: {
      type: String,
      default: 'no-art.png'
    },
    status: {
      type: String,
      default: 'draft'
    },
    url: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId, // ✅ soundkit.model.ts fix ile aynı
      ref: 'User',
      required: true
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

export default model<ITrack>('Track', TrackSchema);