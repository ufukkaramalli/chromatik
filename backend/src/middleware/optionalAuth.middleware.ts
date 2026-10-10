import { Request, Response, NextFunction } from "express";
import { verifyToken } from '../utils/token';
import UserModel from '.././model/user.model';
import IToken from '../interfaces/token.interface';
import * as jwt from 'jsonwebtoken';

async function optionalAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    const bearer = req.headers.authorization;
    
    if(!bearer || !bearer.startsWith('Bearer ')) {
        return next();
    }

    const accessToken = bearer.split('Bearer ')[1].trim();

    try {
        const payload: IToken | jwt.JsonWebTokenError = await verifyToken(accessToken);

        if(payload instanceof jwt.JsonWebTokenError){
            return next();
        }

        const user = await UserModel.findById(payload.id).select('_id').exec();
        
        if(user) {
            (req as any).user = user;
        }

        return next();
    } catch (error: any) {
        return next();
    }
}

export default optionalAuthMiddleware;
