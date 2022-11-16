import {HttpException} from "../types/errors"
import {Request,Response,NextFunction} from "express" 

export const sessionIsUser = (req:Request,res:Response,next:NextFunction) => {
    req.user ? next() : next(new HttpException(401,"session is not logged in."))
}

export const sessionIsUserless = (req:Request,res:Response,next:NextFunction) => {
    req.user === undefined ? next() : next(new HttpException(401,"user is already logged in."))
}
