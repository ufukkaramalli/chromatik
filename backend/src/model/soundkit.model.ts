import mongoose, { Schema, model } from 'mongoose';
import ISoundkit from '.././interfaces/soundkit.interface';
import { Types } from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     createSoundkitInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - url
 *         - userId
 *       properties:
 *         title:
 *           type: string
 *           example: "808 Drum Kit"
 *         description:
 *           type: string
 *           example: "A collection of 808 bass samples."
 *         thumbnailUrl:
 *           type: string
 *           example: "thumbnail.png"
 *         url:
 *           type: string
 *           example: "https://cdn.example.com/soundkits/808.zip"
 *         userId:
 *           type: string
 *           example: "64f0c2e9a1234567890abcd1"
 *
 *     deleteSoundkitInput:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: string
 *           example: "64f0c2e9a1234567890abcd1"
 *
 *     Soundkit:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f0c2e9a1234567890abcd1"
 *         title:
 *           type: string
 *           example: "808 Drum Kit"
 *         description:
 *           type: string
 *           example: "A collection of 808 bass samples."
 *         thumbnailUrl:
 *           type: string
 *           example: "thumbnail.png"
 *         url:
 *           type: string
 *           example: "https://cdn.example.com/soundkits/808.zip"
 *         userId:
 *           type: string
 *           example: "64f0c2e9a1234567890abcd1"
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
 *           example: "64f0c2e9a1234567890abcd1"
 */

const SoundkitSchema = new Schema<ISoundkit>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      default: 'no-thumbnail.png'
    },
    url: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId, // ✅ HATA FIX
      ref: 'User',
      required: true
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

export default model<ISoundkit>('Soundkit', SoundkitSchema);