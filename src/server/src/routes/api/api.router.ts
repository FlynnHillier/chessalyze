import  {Router} from "express"
import {game_router} from "./game/game.router"
import {sessionIsUser} from "../../controllers/sessionOccupancy"
import {api_dev_router} from "./dev/dev.router"
import {api_user_router} from "./user/api.user.router"

export const api_router = Router()

api_router.use("/u",api_user_router)
api_router.use("/game",sessionIsUser,game_router)
api_router.use("/dev",sessionIsUser,api_dev_router)

export default api_router