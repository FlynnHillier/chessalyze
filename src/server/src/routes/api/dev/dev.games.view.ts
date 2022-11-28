import { NextFunction,Request,Response } from "express";
import GameManager from "../../../game/game";

export const viewGames = (req:Request,res:Response,next:NextFunction) => {
    res.send(GameManager.gameStates.map((gameState)=>{return {id:gameState.id,players:gameState.players}}))
}