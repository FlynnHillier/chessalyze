import  {Router} from "express"
import {lobby_router} from "./lobby/lobby.router"

export const game_router = Router()

game_router.use("/lobby",lobby_router)


export default game_router