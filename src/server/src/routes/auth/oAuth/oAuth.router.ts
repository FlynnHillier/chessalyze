import  {Router} from "express"
import {google_router} from "./google.router"

export const oAuth_router = Router()

oAuth_router.use("/google",google_router)

export default oAuth_router