import  {Router} from "express"
import {lobby_get_router} from "./lobby.get"
import {lobby_leave_router} from "./lobby.leave"
import lobby_status_router from "./lobby.status"

export const lobby_router = Router()

lobby_router.use("/get",lobby_get_router)
lobby_router.use("/leave",lobby_leave_router)
lobby_router.use("/status",lobby_status_router)


export default lobby_router