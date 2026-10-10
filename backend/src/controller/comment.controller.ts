import { Router, Request, Response, NextFunction } from 'express';
import IController from '../interfaces/controller.interface';
import HttpException from '../utils/exceptions/http.exception';
import authenticated from '../middleware/authenticated.middleware';
import CommentService from '../service/comment.service';

class CommentController implements IController {
    public path = '/comments';
    public router: Router = Router();
    private CommentService = new CommentService();

    constructor() {
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        this.router.get(
            `${this.path}/:targetType/:targetId`,
            this.getComments
        );

        this.router.post(
            `${this.path}/:targetType/:targetId`,
            authenticated,
            this.createComment
        );

        this.router.delete(
            `${this.path}/:commentId`,
            authenticated,
            this.deleteComment
        );
    }

    /**
     * @openapi
     * /api/comments/{targetType}/{targetId}:
     *   get:
     *     tags:
     *       - Comment
     *     summary: Get comments for a track or soundkit
     *     description: Returns a list of comments associated with the given target type and id.
     *     parameters:
     *       - in: path
     *         name: targetType
     *         required: true
     *         schema:
     *           type: string
     *           enum: [track, soundkit]
     *         description: Target entity type (track or soundkit)
     *       - in: path
     *         name: targetId
     *         required: true
     *         schema:
     *           type: string
     *         description: The target entity ID
     *     responses:
     *       '200':
     *         description: List of comments
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 comments:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Comment'
     *       '400':
     *         description: Invalid target type
     *       '500':
     *         description: Internal server error
     */
    private getComments = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { targetType, targetId } = req.params;
            if (targetType !== 'track' && targetType !== 'soundkit') {
                return next(new HttpException(400, 'Invalid target type. Must be track or soundkit.'));
            }

            const comments = await this.CommentService.getComments(targetType, targetId);
            return res.status(200).json({ comments });
        } catch (error: any) {
            return next(new HttpException(500, error.message || 'Cannot fetch comments'));
        }
    };

    /**
     * @openapi
     * /api/comments/{targetType}/{targetId}:
     *   post:
     *     tags:
     *       - Comment
     *     summary: Create a comment for a track or soundkit
     *     description: Adds a new comment. Authenticated users only.
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: targetType
     *         required: true
     *         schema:
     *           type: string
     *           enum: [track, soundkit]
     *         description: Target entity type (track or soundkit)
     *       - in: path
     *         name: targetId
     *         required: true
     *         schema:
     *           type: string
     *         description: The target entity ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - content
     *             properties:
     *               content:
     *                 type: string
     *                 example: "Amazing bassline in this beat!"
     *               audioTimestamp:
     *                 type: number
     *                 example: 74.5
     *     responses:
     *       '201':
     *         description: Comment created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 comment:
     *                   $ref: '#/components/schemas/Comment'
     *       '400':
     *         description: Bad request (missing content or invalid target type)
     *       '401':
     *         description: Unauthorized
     *       '500':
     *         description: Internal server error
     */
    private createComment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { targetType, targetId } = req.params;
            const { content, audioTimestamp } = req.body;

            if (targetType !== 'track' && targetType !== 'soundkit') {
                return next(new HttpException(400, 'Invalid target type. Must be track or soundkit.'));
            }

            if (!content || !content.trim()) {
                return next(new HttpException(400, 'Comment content cannot be empty.'));
            }

            const comment = await this.CommentService.createComment(
                targetType,
                targetId,
                req.user._id,
                content.trim(),
                audioTimestamp
            );

            return res.status(201).json({ comment });
        } catch (error: any) {
            return next(new HttpException(500, error.message || 'Cannot create comment'));
        }
    };

    /**
     * @openapi
     * /api/comments/{commentId}:
     *   delete:
     *     tags:
     *       - Comment
     *     summary: Delete a comment
     *     description: Deletes a comment by ID. Allowed for comment author or admin.
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: commentId
     *         required: true
     *         schema:
     *           type: string
     *         description: The comment ID to delete
     *     responses:
     *       '200':
     *         description: Comment deleted successfully
     *       '401':
     *         description: Unauthorized
     *       '403':
     *         description: Forbidden (not comment author)
     *       '404':
     *         description: Comment not found
     *       '500':
     *         description: Internal server error
     */
    private deleteComment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { commentId } = req.params;
            const success = await this.CommentService.deleteComment(
                commentId,
                req.user._id.toString(),
                req.user.role
            );

            if (!success) {
                return next(new HttpException(404, 'Comment not found'));
            }

            return res.status(200).json({ message: 'Comment deleted successfully' });
        } catch (error: any) {
            if (error.message === 'Unauthorized') {
                return next(new HttpException(403, 'You do not have permission to delete this comment'));
            }
            return next(new HttpException(500, error.message || 'Cannot delete comment'));
        }
    };
}

export default CommentController;
