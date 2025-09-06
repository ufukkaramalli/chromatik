import { Router, Request, Response, NextFunction } from 'express';
import IController from '@/interfaces/controller.interface';
import HttpException from '@/utils/exceptions/http.exception';
import validationMiddleware from '@/middleware/validation.middleware';
import validate from '@/utils/validation/user.validation';
import UserService from '@/service/user.service';
import authenticated from '@/middleware/authenticated.middleware';
import IUser from '@/interfaces/user.interface';

class UserController implements IController {
    
    public path = '/user';
    public router = Router();
    private UserService = new UserService();

    constructor(){
        this.initialiseRoutes()
    }

    private initialiseRoutes(): void {
        this.router.post(
            `${this.path}/register`,
            validationMiddleware(validate.register),
            this.register
        );
        this.router.post(
            `${this.path}/login`,
            validationMiddleware(validate.login),
            this.login
        )

        this.router.use(`${this.path}`,authenticated)
        this.router.get(`${this.path}`,this.getUser)
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
            res.status(201).json({token})
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
            res.status(200).json({ token })
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
}

export default UserController