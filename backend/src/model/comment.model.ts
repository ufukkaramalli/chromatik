import { Schema, model } from 'mongoose';
import IComment from '../interfaces/comment.interface';

/**
 * @openapi
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         targetType:
 *           type: string
 *           enum: [track, soundkit]
 *         targetId:
 *           type: string
 *         userId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             slug:
 *               type: string
 *             photoUrl:
 *               type: string
 *         content:
 *           type: string
 *         audioTimestamp:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const CommentSchema = new Schema(
    {
        targetType: {
            type: String,
            required: true,
            enum: ['track', 'soundkit'],
            index: true
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        audioTimestamp: {
            type: Number,
            default: null
        }
    },
    { timestamps: true }
);

CommentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export default model<IComment>('Comment', CommentSchema);
