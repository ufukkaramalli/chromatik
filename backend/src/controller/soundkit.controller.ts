import { Router, Request, Response, NextFunction } from 'express';
import IController from '.././interfaces/controller.interface';
import HttpException from '.././utils/exceptions/http.exception';
import validationMiddleware from '.././middleware/validation.middleware';
import validate from '.././utils/validation/soundkit.validation';
import SoundkitService from '.././service/soundkit.service';
import authenticated from '.././middleware/authenticated.middleware';
import roleMiddleware from '.././middleware/role.middleware';
import ISoundkit from '.././interfaces/soundkit.interface';

class SoundkitController implements IController {
  public path = '/soundkit';
  public router = Router();
  private SoundkitService = new SoundkitService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    // Private routes (auth required)
    this.router.use(`${this.path}`, authenticated);

    /** Create */
    this.router.post(
      `${this.path}`,
      [roleMiddleware, validationMiddleware(validate.create)],
      this.create
    );

    /** Get All */
    this.router.get(`${this.path}/all`, this.getAll);

    /** Get By Id */
    this.router.get(`${this.path}/:id`, this.getById);

    /** Update */
    this.router.put(
      `${this.path}/:id`,
      validationMiddleware(validate.update),
      this.update
    );

    /** Delete */
    this.router.delete(
      `${this.path}/:id`,
      validationMiddleware(validate.deleteSoundkit),
      this.delete
    );
  }

  /**
   * @openapi
   * /api/soundkit:
   *   post:
   *     tags:
   *       - Soundkit
   *     summary: Create a new soundkit
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/createSoundkitInput'
   *     responses:
   *       '201':
   *         description: Soundkit created successfully
   *       '400':
   *         description: Bad Request
   */
  private create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { title, description, thumbnailUrl, url, userId } = req.body;
      const soundkit = await this.SoundkitService.create(
        title,
        description,
        thumbnailUrl,
        url,
        userId
      );
      res.status(201).json({ soundkit });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/soundkit/all:
   *   get:
   *     tags:
   *       - Soundkit
   *     summary: Get all soundkits
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Returns a list of soundkits
   */
  private getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const soundkits = await this.SoundkitService.getAll();
      res.status(200).json(soundkits);
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/soundkit/{id}:
   *   get:
   *     tags:
   *       - Soundkit
   *     summary: Get a soundkit by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: Returns the soundkit
   *       '404':
   *         description: Soundkit not found
   */
  private getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const soundkit = await this.SoundkitService.getById(req.params.id);
      if (!soundkit) return next(new HttpException(404, 'Soundkit not found'));
      res.status(200).json(soundkit);
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/soundkit/{id}:
   *   put:
   *     tags:
   *       - Soundkit
   *     summary: Update a soundkit by ID
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
   *             $ref: '#/components/schemas/Soundkit'
   *     responses:
   *       '200':
   *         description: Successfully updated
   *       '404':
   *         description: Soundkit not found
   */
 private update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await this.SoundkitService.update(req.params.id, req.body);
    if (!updated) return next(new HttpException(404, 'Soundkit not found'));
    res.status(200).json(updated);
  } catch (error: any) {
    next(new HttpException(400, error.message));
  }
};

  /**
   * @openapi
   * /api/soundkit/{id}:
   *   delete:
   *     tags:
   *       - Soundkit
   *     summary: Delete a soundkit by ID
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
   *             $ref: '#/components/schemas/deleteSoundkitInput'
   *     responses:
   *       '200':
   *         description: Successfully deleted
   *       '404':
   *         description: Soundkit not found
   */
  private delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await this.SoundkitService.delete(req.params.id, req.body.userId);
      if (!deleted) return next(new HttpException(404, 'Soundkit not found'));
      res.status(200).json({ message: 'Soundkit deleted' });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };
}

export default SoundkitController;