import { NextFunction,Request,Response,Router } from "express";
import { socketManagment } from "../../../../sockets/index.socket";
import { validateSchema } from "../../../../controllers/schemaValidation";
import { Schema } from "express-validator";

const schema : Schema = {
    playerID:{
        isString:true
    }
}

const getRooms = (req:Request,res:Response,next:NextFunction) => {
    const playerSocket = socketManagment.socketMap.get(req.body.playerID)
    if(!playerSocket){
        return res.status(204).send()
    }
    res.send({rooms:[...playerSocket.rooms]})
}

export const getPlayerSocketRooms = Router().use(validateSchema(schema),getRooms)
