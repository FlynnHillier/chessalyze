import {Request,Response,NextFunction} from "express"
import {GameManager} from "../../../game/game"
import { GameIsPresentException, LobbyIsPresentException,GameIsNotPresentException } from "../../../types/errors"

export const notInGame = (req:Request,res:Response,next:NextFunction) => {
    const existingGame = GameManager.getPlayerGame(req.user!.uuid)
    if(existingGame){
        return next(new GameIsPresentException(existingGame.id))
    }
    next()
}

export const notInLobby = (req:Request,res:Response,next:NextFunction) => {
    const exisitingLobby = GameManager.getPlayerLobby(req.user!.uuid)
    if(exisitingLobby){
        return next(new LobbyIsPresentException(exisitingLobby.id))
    }
    next()
}

export const inGame = (req:Request,res:Response,next:NextFunction) => {
    const existingGame = GameManager.getPlayerGame(req.user!.uuid)
    if(!existingGame){
        return next(new GameIsNotPresentException())
    }
    next()
}