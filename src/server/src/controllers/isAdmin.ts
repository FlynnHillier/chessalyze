import {Request,Response,NextFunction} from "express"
import { PermissionException } from "../types/errors"

export const isAdmin = (req:Request,res:Response,next:NextFunction) => {
    if(req.user?.permission !== "admin"){
        next(new PermissionException())
    }
    next()
}