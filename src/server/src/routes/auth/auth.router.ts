import  {Router} from "express"
import {oAuth_router} from "./oAuth/oAuth.router"

export const auth_router = Router()

auth_router.use("/o",oAuth_router)

export default auth_router