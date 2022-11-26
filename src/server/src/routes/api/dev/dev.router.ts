import { Router } from "express"
import { isAdmin } from "../../../controllers/isAdmin"
import {viewLobbys} from "./dev.lobbys.view"
import {viewGames} from "./dev.games.view"
import {viewSockets} from "./dev.sockets.view"

export const api_dev_router = Router()

api_dev_router.use(isAdmin)
api_dev_router.use("/lobbys/view",viewLobbys)
api_dev_router.use("/games/view",viewGames)
api_dev_router.use("/sockets/view",viewSockets)
