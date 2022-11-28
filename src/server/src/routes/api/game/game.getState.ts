import { Request,Response,NextFunction } from "express"
import {GameManager} from "../../../game/game"
import { GameState } from "../../../game/gameState"

export const getGameState = (req:Request,res:Response,next:NextFunction) => {
    const gameState = GameManager.getPlayerGame(req.user!.uuid) as GameState
    res.send({
        fen:gameState.getFEN(),
        captured:{
            w:gameState.getCaptured("w"),
            b:gameState.getCaptured("b")
        }
    })


    GameManager.getGame
}