import { Router, Request, Response, NextFunction } from 'express';
import IController from '.././interfaces/controller.interface';
import HttpException from '.././utils/exceptions/http.exception';
import validationMiddleware from '.././middleware/validation.middleware';
import validate from '.././utils/validation/track.validation';
import TrackService from '.././service/track.service';
import authenticated from '.././middleware/authenticated.middleware';
import roleMiddleware from '.././middleware/role.middleware';
import ITrack from '.././interfaces/track.interface';

class TrackController implements IController {
  public path = '/track';
  public router = Router();
  private TrackService = new TrackService();

  constructor() {
    this.initialiseRoutes();
  }

  private initialiseRoutes(): void {
    // Private (Auth required)
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
    this.router.delete(`${this.path}/:id`, this.delete);
  }

  /**
   * @openapi
   * /api/track:
   *   post:
   *     tags:
   *       - Track
   *     summary: Create a new track
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/createTrackInput'
   *     responses:
   *       '201':
   *         description: Track created successfully
   *       '400':
   *         description: Bad Request
   */
  private create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { name, description, art, status, url, userId } = req.body;
      const track = await this.TrackService.create(name, description, art, status, url, userId);
      res.status(201).json({ track });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/track/all:
   *   get:
   *     tags:
   *       - Track
   *     summary: Get all tracks
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: Returns a list of tracks
   */
  private getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tracks = await this.TrackService.getAll();
      res.status(200).json(tracks);
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/track/{id}:
   *   get:
   *     tags:
   *       - Track
   *     summary: Get a track by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: Returns the track
   *       '404':
   *         description: Track not found
   */
  private getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const track = await this.TrackService.getById(req.params.id);
      if (!track) return next(new HttpException(404, 'Track not found'));
      res.status(200).json(track);
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/track/{id}:
   *   put:
   *     tags:
   *       - Track
   *     summary: Update a track by ID
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
   *             $ref: '#/components/schemas/Track'
   *     responses:
   *       '200':
   *         description: Successfully updated
   *       '404':
   *         description: Track not found
   */
  private update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.TrackService.update(req.params.id, req.body);
      if (!updated) return next(new HttpException(404, 'Track not found'));
      res.status(200).json(updated);
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };

  /**
   * @openapi
   * /api/track/{id}:
   *   delete:
   *     tags:
   *       - Track
   *     summary: Delete a track by ID
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: Successfully deleted
   *       '404':
   *         description: Track not found
   */
  private delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await this.TrackService.delete(req.params.id);
      if (!deleted) return next(new HttpException(404, 'Track not found'));
      res.status(200).json({ message: 'Track deleted' });
    } catch (error: any) {
      next(new HttpException(400, error.message));
    }
  };
}

export default TrackController;