import { NextFunction,Request,Response } from "express";
import { socketManagment } from "../../../../sockets/index.socket";

export const viewSockets = (req:Request,res:Response,next:NextFunction) => {
    res.send([...socketManagment.socketMap.keys()])
}