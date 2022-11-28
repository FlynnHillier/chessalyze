import { NextFunction,Request,Response } from "express";
import { socketMap } from "../../../../sockets/index.socket";

export const viewSockets = (req:Request,res:Response,next:NextFunction) => {
    res.send([...socketMap.keys()])
}