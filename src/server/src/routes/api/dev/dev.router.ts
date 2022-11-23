import { Router } from "express"
import { isAdmin } from "../../../controllers/isAdmin"
import {viewLobbys} from "./dev.lobbys.view"
import {viewGames} from "./dev.games.view"

export const api_dev_router = Router()

api_dev_router.use(isAdmin)
api_dev_router.use("/lobbys/view",viewLobbys)
api_dev_router.use("/games/view",viewGames)