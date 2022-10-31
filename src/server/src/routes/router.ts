import {Router} from "express"
import {api_router} from "./api/api.router"
import {auth_router} from "./auth/auth.router"

export const router = Router()

//router.use("/",()=>{console.log("joe")})

router.use("/api",api_router)
router.use("/auth",auth_router)

export default router