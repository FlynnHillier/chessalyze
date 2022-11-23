import { NextFunction,Request,Response } from "express";
import GameManager from "../../../game/game";

export const viewLobbys = (req:Request,res:Response,next:NextFunction) => {
    res.send(GameManager.gameLobbys)
}