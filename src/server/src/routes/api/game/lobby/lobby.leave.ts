import  {Router,Request,Response} from "express"
import {GameManager} from "./../../../../game/game"
import { validateSchema } from "../../../../controllers/schemaValidation"
import { notInGame,inLobby } from "../game.middleware"
import { socketMap } from "../../../../sockets/index.socket"
import { Socket } from "socket.io"

export const lobby_get_router = Router()

const leaveLobby = (req:Request,res:Response) => {
    const lobby = GameManager.getPlayerLobby(req.user!.uuid)
    GameManager.endLobby(lobby!.id)
    res.status(204).send()
}

lobby_get_router.get("/",notInGame,inLobby,leaveLobby)

export default lobby_get_router