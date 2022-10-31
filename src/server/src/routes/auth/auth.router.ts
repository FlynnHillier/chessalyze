import  {Router} from "express"
import {oAuth_router} from "./oAuth/oAuth.router"
import {logout_router} from "./logout.router"

export const auth_router = Router()

auth_router.use("/o",oAuth_router)
auth_router.use("/logout",logout_router)

export default auth_router