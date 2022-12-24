import  {Router,Request,Response} from "express"
import {GameManager} from "./../../../../game/game"
import { notInGame, notInLobby } from "../game.middleware"

export const lobby_create_router = Router()

const createLobby = (req:Request,res:Response) => {
    res.send({lobbyID:GameManager.createLobby({id:req.user!.uuid,displayName:req.user!.name}).id})
}

lobby_create_router.get("/",notInGame,notInLobby,createLobby)


export default lobby_create_router