import  {Router,Request,Response} from "express"
import {GameManager} from "./../../../../game/game"
import { notInGame,inLobby } from "../game.middleware"

export const lobby_leave_router = Router()

const leaveLobby = (req:Request,res:Response) => {
    const lobby = GameManager.getPlayerLobby(req.user!.uuid)
    GameManager.endLobby(lobby!.id)
    res.status(204).send()
}

lobby_leave_router.get("/",notInGame,inLobby,leaveLobby)

export default lobby_leave_router