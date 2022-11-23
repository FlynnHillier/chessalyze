import  {Router} from "express"
import {game_router} from "./game/game.router"
import {sessionIsUser} from "../../controllers/sessionOccupancy"
import {api_dev_router} from "./dev/dev.router"

export const api_router = Router()

api_router.use(sessionIsUser) //protected routes below
api_router.use("/game",game_router)
api_router.use("/dev",api_dev_router)

export default api_router