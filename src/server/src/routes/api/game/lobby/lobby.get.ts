import  {Router,Request,Response} from "express"
import {GameManager} from "./../../../../game/game"

export const lobby_get_router = Router()

const getLobby = (req:Request,res:Response) => {
    const lobby = GameManager.getPlayerLobby(req.user!.uuid)
    res.send({lobbyID:lobby?.id || null})
}

lobby_get_router.get("/",getLobby)

export default lobby_get_router