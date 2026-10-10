import { Document, Types } from 'mongoose';

export default interface IComment extends Document {
    targetType: 'track' | 'soundkit';
    targetId: Types.ObjectId;
    userId: Types.ObjectId;
    content: string;
    audioTimestamp?: number | null;
    createdAt: Date;
    updatedAt: Date;
}
