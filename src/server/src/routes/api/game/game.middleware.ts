import {Request,Response,NextFunction} from "express"
import {GameManager} from "../../../game/game"
import { GamePresenceException, lobbyPresenceException } from "../../../types/errors"

export const notInGame = (req:Request,res:Response,next:NextFunction) => {
    const existingGame = GameManager.getPlayerGame(req.user!.uuid)
    if(existingGame){
        return next(new GamePresenceException(existingGame.id))
    }
    next()
}

export const notInLobby = (req:Request,res:Response,next:NextFunction) => {
    const exisitingLobby = GameManager.getPlayerLobby(req.user!.uuid)
    if(exisitingLobby){
        return next(new lobbyPresenceException(exisitingLobby.id))
    }
    next()
}