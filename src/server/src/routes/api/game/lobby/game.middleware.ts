import {Request,Response,NextFunction} from "express"
import {GameManager} from "../../../../game/game"
import { GamePresenceException } from "../../../../types/errors"

export const notInGame = (req:Request,res:Response,next:NextFunction) => {
    const existingGame = GameManager.getPlayerGame(req.user!.uuid)
    if(existingGame){
        return next(new GamePresenceException({gameID:existingGame.id}))
    }
    next()
}