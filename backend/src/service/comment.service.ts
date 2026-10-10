import CommentModel from '../model/comment.model';
import IComment from '../interfaces/comment.interface';
import { Types } from 'mongoose';

class CommentService {
    private comment = CommentModel;

    public async getComments(targetType: 'track' | 'soundkit', targetId: string): Promise<any[]> {
        return this.comment
            .find({ targetType, targetId: new Types.ObjectId(targetId) })
            .populate('userId', 'name slug photoUrl')
            .sort({ createdAt: -1 })
            .lean();
    }

    public async createComment(
        targetType: 'track' | 'soundkit',
        targetId: string,
        userId: Types.ObjectId | string,
        content: string,
        audioTimestamp?: number | null
    ): Promise<any> {
        const comment = await this.comment.create({
            targetType,
            targetId: new Types.ObjectId(targetId),
            userId,
            content,
            audioTimestamp: typeof audioTimestamp === 'number' && audioTimestamp >= 0 ? audioTimestamp : null
        });

        return (await comment.populate('userId', 'name slug photoUrl'));
    }

    public async deleteComment(
        commentId: string,
        userId: string,
        userRole?: string
    ): Promise<boolean> {
        const comment = await this.comment.findById(commentId);
        if (!comment) return false;

        const isAuthor = comment.userId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isAuthor && !isAdmin) {
            throw new Error('Unauthorized');
        }

        await this.comment.findByIdAndDelete(commentId);
        return true;
    }
}

export default CommentService;
