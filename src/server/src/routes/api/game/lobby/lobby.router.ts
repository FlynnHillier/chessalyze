import  {Router} from "express"
import {lobby_create_router} from "./lobby.create"
import {lobby_join_router} from "./lobby.join"
import {lobby_get_router} from "./lobby.get"

export const lobby_router = Router()

lobby_router.use("/create",lobby_create_router)
lobby_router.use("/join",lobby_join_router)
lobby_router.use("/get",lobby_get_router)


export default lobby_router