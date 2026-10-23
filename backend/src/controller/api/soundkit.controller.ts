import { NextFunction, Request, Response, Router } from "express";
import IController from '../../interfaces/controller.interface';
import HttpException from '../../utils/exceptions/http.exception';
import validationMiddleware from '../../middleware/validation.middleware';
import validate from '../../utils/validation/soundkit.validation'
import SoundkitService from '../../service/soundkit.service';
import authenticated from '../../middleware/authenticated.middleware';
import roleMiddleware from '../../middleware/role.middleware';
import { Types } from "mongoose";
import ISoundkit from '../../interfaces/soundkit.interface';

class SoundkitController implements IController {
    public path = '/soundkit';
    public router: Router = Router();
    private SoundkitService = new SoundkitService();

    constructor(){
        /** Route Guard */
        this.router.use(`${this.path}`,[authenticated,roleMiddleware])
        this.initialiseRoutes();
    }

    private initialiseRoutes(): void {
        
        /**
        * CREATE SOUNDKIT ROUTE // 
        * Define Route Path ex. `${this.path}/:id`
        * Define Middlewares ex. [authenticated, roleMiddleware, validationMiddleware(validate.create)]
        * calls private update handler    
        */

        this.router.post(

            `${this.path}`,
            [
                validationMiddleware(validate.create)
            ],
            this.create
        )

        /**
        * UPDATE SOUNDKIT ROUTE // 
        * Define Route Path ex. `${this.path}/:id`
        * Define Middlewares ex. [authenticated, roleMiddleware, validationMiddleware(validate.create)]
        * calls private update handler    
        */

         this.router.put(
            `${this.path}/:id`,
            [
                validationMiddleware(validate.create)
            ],
            this.update
        )

        /**
        * DELETE SOUNDKIT ROUTE // 
        * Define Route Path ex. `${this.path}/:id`
        * Define Middlewares ex. [authenticated, roleMiddleware, validationMiddleware(validate.create)]
        * calls private update handler    
        */

         this.router.delete(
            `${this.path}/:id`,
            [
                validationMiddleware(validate.deleteSoundkit)
            ],
            this.delete
        )
    }

    /**
     * @openapi
     * /api/soundkit:
     *   post:
     *     tags:
     *       - Soundkit
     *     summary: Create a new soundkit
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               thumbnailUrl:
     *                 type: string
     *               url:
     *                 type: string
     *               userId:
     *                 type: string
     *     responses:
     *       '201':
     *         description: Soundkit created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 soundkit:
     *                   $ref: '#/components/schemas/Soundkit'
     *       '400':
     *         description: Bad Request
     *       '401':
     *         description: Unauthorized
     */
    private create = async (req:Request,res:Response,next: NextFunction): Promise<Response | void> => {
        try {
            const { title, description, thumbnailUrl, url, userId} = req.body
            const soundkit = await this.SoundkitService.create(title, description, thumbnailUrl, url, userId)
            res.status(201).json({soundkit})
        } catch (error:any) {
            next(new HttpException(400, 'Cannot create soundkit'))
        }
    }

    /**
     * @openapi
     * /api/soundkit/{id}:
     *   put:
     *     tags:
     *       - Soundkit
     *     summary: Update an existing soundkit
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Soundkit ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *               thumbnailUrl:
     *                 type: string
     *               url:
     *                 type: string
     *               userId:
     *                 type: string
     *     responses:
     *       '201':
     *         description: Soundkit updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 soundkit:
     *                   $ref: '#/components/schemas/Soundkit'
     *       '400':
     *         description: Bad Request
     *       '401':
     *         description: Unauthorized
     */
    private update = async (req:Request, res:Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id } = req.params
            const { title, description, thumbnailUrl, url, userId } = req.body
            if(req.user.id !== userId){
                next(new HttpException(400, 'You are not authorized to update this soundkit'))
            }
            const soundkit = await this.SoundkitService.update(id,title,description,thumbnailUrl,url, userId)
            res.status(201).json({soundkit})   
        } catch (e) {
            next(new HttpException(400, 'Cannot update soundkit'))
        }
    }

    /**
     * @openapi
     * /api/soundkit/{id}:
     *   delete:
     *     tags:
     *       - Soundkit
     *     summary: Delete a soundkit
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Soundkit ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               userId:
     *                 type: string
     *     responses:
     *       '201':
     *         description: Soundkit deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 soundkit:
     *                   $ref: '#/components/schemas/Soundkit'
     *       '400':
     *         description: Bad Request
     *       '401':
     *         description: Unauthorized
     */
    private delete = async (req: Request, res: Response, next: NextFunction) : Promise<Response | void> => {
        try {
            const { id } = req.params
            const { userId } = req.body
            if(req.user.id !== userId){
                next(new HttpException(400, 'You are not authorized to delete this soundkit'))
            }
            const soundkit = await this.SoundkitService.delete(id, userId)
            res.status(201).json({soundkit})
        } catch (error) {
            next(new HttpException(400, 'Cannot delete soundkit'))
        }
    }
}

export default SoundkitController