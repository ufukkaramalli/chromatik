import { Router, Request, Response, NextFunction } from 'express';
import IController from '../../interfaces/controller.interface';
import HttpException from '../../utils/exceptions/http.exception';
import validationMiddleware from '../../middleware/validation.middleware';
import validate from '../../utils/validation/user.validation';
import UserService from '../../service/user.service';
import authenticated from '../../middleware/authenticated.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';
import IUser from '../../interfaces/user.interface';
import { upload } from '../../utils/upload';

class UserController implements IController {
    
    public path = '/user';
    public router: Router = Router();
    private UserService = new UserService();

    constructor(){
        this.initialiseRoutes()
    }

    private initialiseRoutes(): void {
        this.router.post(
            `${this.path}/register`,
            authLimiter,
            validationMiddleware(validate.register),
            this.register
        );
        this.router.post(
            `${this.path}/login`,
            authLimiter,
            validationMiddleware(validate.login),
            this.login
        )
        this.router.post(
            `${this.path}/logout`,
            authenticated,
            this.logout
        )

        this.router.get(`${this.path}/profile/:slug`, this.getProfile)
        
        this.router.use(`${this.path}`,authenticated)
        this.router.get(`${this.path}`,this.getUser)
        this.router.put(`${this.path}/settings`, this.updateSettings)
        this.router.post(`${this.path}/avatar`, upload.single('avatar'), this.updateAvatar)
    }

/**
 * @openapi
 * /api/user/register:
 *   post:
 *     tags:
 *       - User
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createUserInput'
 *     responses:
 *       '201':
 *         description: Successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/createUserResponse'
 *       '409':
 *         description: Conflict
 *       '400':
 *         description: Bad Request
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     createUserResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

    private register = async (
        req: Request<{},{},IUser>,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { name, email, password } = req.body
            const token = await this.UserService.register(
                name,
                email,
                password
            )
            res.status(201).json({ success: true, token })
        } catch (error: any) {
            next(new HttpException(400, error.message))
        }
    }
    /**
     * @openapi
     * /api/user/login:
     *   post:
     *     tags:
     *      - "User"
     *     description: 
     *     responses:
     *          200:
     *              description: Returns the current logged in user
     *          401:
     *             description: Unauthorized
     * 
     */
    private login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const {email, password} = req.body 
            const token = await this.UserService.login(email, password)
            res.status(200).json({ success: true, token })
        } catch (error: any) {
            next(new HttpException(400, error.message))
        }
    }
    /**
 * @openapi
 * /api/user:
 *   get:
 *     tags:
 *       - User
 *     summary: Get currently logged in user
 *     security:
 *       - bearerAuth: []    # JWT veya token auth
 *     responses:
 *       '200':
 *         description: Returns the current logged in user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 */
    private getUser = (
        req: Request,
        res: Response,
        next: NextFunction
    ): Response<Omit<IUser,'_id'>> | void => {
        if (!req.user) {
            return next(new HttpException(404, 'No logged in user'));
        }
        res.status(200).json({user: req.user})
    }

    /**
     * @openapi
     * /api/user/logout:
     *   post:
     *     tags:
     *       - User
     *     summary: Logout user
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Logged out successfully
     *       '401':
     *         description: Unauthorized
     */
    private logout = (
        req: Request,
        res: Response,
        next: NextFunction
    ): Response | void => {
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }

    /**
     * @openapi
     * /api/user/profile/{slug}:
     *   get:
     *     tags:
     *       - User
     *     summary: Get public profile of a user by slug
     *     parameters:
     *       - in: path
     *         name: slug
     *         required: true
     *         schema:
     *           type: string
     *         description: User slug
     *     responses:
     *       '200':
     *         description: Returns user profile with tracks and soundkits
     *       '404':
     *         description: User not found
     */
    private getProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { slug } = req.params;
            const user = await this.UserService.getProfileBySlug(slug);
            if (!user) {
                return next(new HttpException(404, 'User not found'));
            }
            res.status(200).json({ profile: user });
        } catch (error: any) {
            next(new HttpException(500, 'Cannot fetch profile'));
        }
    }

    /**
     * @openapi
     * /api/user/settings:
     *   put:
     *     tags:
     *       - User
     *     summary: Update user profile settings
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *               slug:
     *                 type: string
     *               password:
     *                 type: string
     *               language:
     *                 type: string
     *               dateOfBirth:
     *                 type: string
     *                 format: date
     *               bio:
     *                 type: string
     *               location:
     *                 type: string
     *               profileTheme:
     *                 type: string
     *                 enum: [ribbons, flowfield, pillars]
     *                 description: Hero animation shown to all visitors of the profile
     *               socialLinks:
     *                 type: object
     *                 properties:
     *                   instagram:
     *                     type: string
     *                   twitter:
     *                     type: string
     *                   youtube:
     *                     type: string
     *                   soundcloud:
     *                     type: string
     *     responses:
     *       '200':
     *         description: Successfully updated settings
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 user:
     *                   $ref: '#/components/schemas/User'
     *       '400':
     *         description: Bad Request
     *       '401':
     *         description: Unauthorized
     */
    private updateSettings = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const user = await this.UserService.updateSettings((req as any).user._id, req.body);
            res.status(200).json({ success: true, user });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    }

    /**
     * @openapi
     * /api/user/avatar:
     *   post:
     *     tags:
     *       - User
     *     summary: Update user avatar
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               avatar:
     *                 type: string
     *                 format: binary
     *     responses:
     *       '200':
     *         description: Avatar updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 photoUrl:
     *                   type: string
     *       '400':
     *         description: Bad Request
     *       '401':
     *         description: Unauthorized
     */
    private updateAvatar = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            if (!req.file) return next(new HttpException(400, 'No file uploaded'));
            const userId = (req as any).user._id;
            const year = new Date().getFullYear();
            const photoUrl = `/uploads/${String(userId)}/${year}/avatar/${req.file.filename}`;
            const user = await this.UserService.updateAvatar(userId, photoUrl);
            res.status(200).json({ success: true, photoUrl });
        } catch (error: any) {
            next(new HttpException(400, error.message));
        }
    }
}

export default UserController