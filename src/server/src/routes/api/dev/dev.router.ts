import { Router } from "express"
import { isAdmin } from "../../../controllers/isAdmin"
import {viewLobbys} from "./dev.lobbys.view"
import {viewGames} from "./dev.games.view"
import {viewSockets} from "./sockets/dev.sockets.view"
import {getPlayerSocketRooms} from "./sockets/dev.sockets.rooms"

export const api_dev_router = Router()

api_dev_router.use(isAdmin)
api_dev_router.use("/lobbys/view",viewLobbys)
api_dev_router.use("/games/view",viewGames)
api_dev_router.get("/sockets/view",viewSockets)
api_dev_router.post("/sockets/rooms",getPlayerSocketRooms)

