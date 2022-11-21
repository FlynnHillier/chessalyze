import  {Router} from "express"
import {game_router} from "./game/game.router"
import {sessionIsUser} from "../../controllers/sessionOccupancy"

export const api_router = Router()

api_router.use(sessionIsUser) //protected routes below
api_router.use("/game",game_router)

export default api_router