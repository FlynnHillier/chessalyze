import  {Router} from "express"
import {lobby_router} from "./lobby/lobby.router"
import {getGameState} from "./game.getState"
import { inGame } from "./game.middleware"
import gameMove from "./game.move"

export const game_router = Router()

game_router.use("/lobby",lobby_router)
game_router.use("/getState",getGameState)
game_router.use("/move",gameMove)

export default game_router