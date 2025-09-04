import IUser from "@/interfaces/user.interface";
import HttpException from "@/utils/exceptions/http.exception";
import { Request, Response, NextFunction } from "express";

async function roleMiddleware(
    req:Request,
    res: Response,
    next: NextFunction
): Promise<Response | void>{
    try {
        const role: IUser['role'] = req.user.role
        if (role === 'producer' || 'admin'){
            return next();
        }else{
            return next(new HttpException(401,'Unauthorised'))
        }
    } catch (error: any) {
        return next(new HttpException(401,'Unauthorised'))
    }
}

export default roleMiddleware