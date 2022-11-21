import  {Router,Request,Response} from "express"
import {GameManager} from "./../../../../game/game"
import { notInGame } from "./game.middleware"

export const lobby_create_router = Router()

const createLobby = (req:Request,res:Response) => {
    const exisitingLobby = GameManager.getPlayerLobby(req.user!.uuid)
    if(exisitingLobby != null){
        return res.send({
            lobbyID:exisitingLobby.id
        })
    }
    const lobby = GameManager.createLobby(req.user!.uuid)
    res.send({lobbyID:lobby.id})
}

lobby_create_router.get("/",notInGame,createLobby)


export default lobby_create_router