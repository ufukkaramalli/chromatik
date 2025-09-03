import { NextFunction, Request, Response, Router } from "express";
import IController from "@/interfaces/controller.interface";
import HttpException from "@/utils/exceptions/http.exception";
import validationMiddleware from "@/middleware/validation.middleware";
import validate from '@/utils/validation/soundkit.validation'
import SoundkitService from '@/service/soundkit.service';
import authenticated from '@/middleware/authenticated.middleware';
import roleMiddleware from "@/middleware/role.middleware";
import { Types } from "mongoose";
import ISoundkit from "@/interfaces/soundkit.interface";

class SoundkitController implements IController {
    public path = '/soundkit';
    public router = Router();
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

    private create = async (req:Request,res:Response,next: NextFunction): Promise<Response | void> => {
        try {
            const { title, description, thumbnailUrl, url, userId} = req.body
            const soundkit = await this.SoundkitService.create(title, description, thumbnailUrl, url, userId)
            res.status(201).json({soundkit})
        } catch (error:any) {
            next(new HttpException(400, 'Cannot create soundkit'))
        }
    }

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