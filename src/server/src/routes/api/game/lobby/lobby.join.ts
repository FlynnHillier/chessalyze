import  {Router,Request,Response} from "express"
import {GameManager} from "./../../../../game/game"
import {checkSchema,Schema} from "express-validator"
import { notInGame } from "./game.middleware"
import { validateSchema } from "../../../../controllers/schemaValidation"

export const lobby_join_router = Router()

const joinLobby = (req:Request,res:Response) => {
    const exisitingLobby = GameManager.getPlayerLobby(req.user!.uuid)
    res.send({
        gameID:GameManager.joinLobby(req.body.lobbyID,req.user!.uuid)?.id || null
    })
    if(exisitingLobby !== null){
        GameManager.endLobby(exisitingLobby.id)
    }
}

const schema_join_post : Schema = {
    lobbyID:{
        isString:true
    }
}

lobby_join_router.post("/",validateSchema(schema_join_post),notInGame,joinLobby)


export default lobby_join_router