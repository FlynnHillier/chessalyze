import  {Router} from "express"
import {lobby_router} from "./lobby/lobby.router"
import {getGameState} from "./game.getState"
import { inGame } from "./game.middleware"

export const game_router = Router()

game_router.use("/lobby",lobby_router)
game_router.use("/getState",inGame,getGameState)


export default game_router