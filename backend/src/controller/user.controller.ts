import { Router, Request, Response, NextFunction } from 'express';
import IController from '.././interfaces/controller.interface';
import HttpException from '.././utils/exceptions/http.exception';
import validationMiddleware from '.././middleware/validation.middleware';
import validate from '.././utils/validation/user.validation';
import UserService from '.././service/user.service';
import authenticated from '.././middleware/authenticated.middleware';
import IUser from '.././interfaces/user.interface';

class UserController implements IController {
  public path = '/user';
  public router = Router();
  private UserService = new UserService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    // Public
    this.router.post(`${this.path}/register`,
      validationMiddleware(validate.register),
      this.register);

    this.router.post(`${this.path}/login`,
      validationMiddleware(validate.login),
      this.login);

    // Private (requires auth)
    this.router.use(`${this.path}`, authenticated);

    this.router.get(`${this.path}`, this.getUser);
    this.router.get(`${this.path}/all`, this.getAll);
    this.router.get(`${this.path}/:id`, this.getById);
    this.router.put(`${this.path}/:id`, this.updateUser);
    this.router.delete(`${this.path}/:id`, this.deleteUser);
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
   *       '400':
   *         description: Bad Request
   */
  private register = async (
    req: Request<{}, {}, IUser>,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { name, email, password } = req.body;
      const token = await this.UserService.register(name, email, password);
      res.status(201).json({ token });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/user/login:
   *   post:
   *     tags:
   *       - User
   *     summary: Login user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       '200':
   *         description: Successfully logged in
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *       '400':
   *         description: Bad Request
   */
  private login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { email, password } = req.body;
      const token = await this.UserService.login(email, password);
      res.status(200).json({ token });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/user:
   *   get:
   *     tags:
   *       - User
   *     summary: Get currently logged in user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Returns the current logged in user
   *       '401':
   *         description: Unauthorized
   */
  private getUser = (
    req: Request,
    res: Response,
    next: NextFunction
  ): Response<Omit<IUser, '_id'>> | void => {
    if (!req.user) {
      return next(new HttpException(404, 'No logged in user'));
    }
    res.status(200).json({ user: req.user });
  };

  /**
   * @openapi
   * /api/user/all:
   *   get:
   *     tags:
   *       - User
   *     summary: Get all users
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Returns a list of users
   */
  private getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.UserService.getAll();
      res.status(200).json(users);
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/user/{id}:
   *   get:
   *     tags:
   *       - User
   *     summary: Get a user by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Returns the user
   *       '404':
   *         description: User not found
   */
  private getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.UserService.getById(req.params.id);
      if (!user) return next(new HttpException(404, 'User not found'));
      res.status(200).json(user);
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/user/{id}:
   *   put:
   *     tags:
   *       - User
   *     summary: Update a user by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/User'
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Successfully updated
   *       '404':
   *         description: User not found
   */
  private updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.UserService.update(req.params.id, req.body);
      if (!updated) return next(new HttpException(404, 'User not found'));
      res.status(200).json(updated);
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/user/{id}:
   *   delete:
   *     tags:
   *       - User
   *     summary: Delete a user by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Successfully deleted
   *       '404':
   *         description: User not found
   */
  private deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await this.UserService.delete(req.params.id);
      if (!deleted) return next(new HttpException(404, 'User not found'));
      res.status(200).json({ message: 'User deleted' });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };
}

export default UserController;