import  {Router,Request,Response} from "express"
import {GameManager} from "./../../../../game/game"
import { Schema } from "express-validator"
import { notInGame } from "../game.middleware"
import { validateSchema } from "../../../../controllers/schemaValidation"

export const lobby_join_router = Router()

const joinLobby = (req:Request,res:Response) => {
    const existingUserLobby = GameManager.getPlayerLobby(req.user!.uuid)
    let gameJoinResult = GameManager.joinLobby(req.body.lobbyID,req.user!.uuid)
    
    if(gameJoinResult === null){
        return res.send({
            success:false,
            gameDetails:null
        })
    }

    if(existingUserLobby !== null){
        GameManager.endLobby(existingUserLobby.id)
    }
    res.send({
        success:true,
        gameDetails:{
            players:gameJoinResult.players,
            captured:{
                w:gameJoinResult.getCaptured("w"),
                b:gameJoinResult.getCaptured("b"),
            },
            colour:gameJoinResult.getPlayerColor(req.user!.uuid)
        }
    })
}

const schema : Schema = {
    lobbyID:{
        isString:true
    }
}

lobby_join_router.post("/",validateSchema(schema),notInGame,joinLobby)


export default lobby_join_router