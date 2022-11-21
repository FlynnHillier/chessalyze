import  {Router} from "express"
import {lobby_create_router} from "./lobby.create"
import {lobby_join_router} from "./lobby.join"

export const lobby_router = Router()

lobby_router.use("/create",lobby_create_router)
lobby_router.use("/join",lobby_join_router)


export default lobby_router