import  {Router,Request,Response} from "express"
import {GameManager} from "./../../../../game/game"

export const lobby_status_router = Router()

const getLobby = (req:Request,res:Response) => {
    const lobby = GameManager.getPlayerLobby(req.user!.uuid)
    if(lobby === null){
        return res.send({
            isInLobby:false
        })
    }

    res.send({
        isInLobby:true,
        lobbyDetails:{
            id:lobby.id
        }
    })
}

lobby_status_router.get("/",getLobby)

export default lobby_status_router