import {Router} from "express"
import {auth_vanilla_login_router} from "./vanilla.login"
import {auth_vanilla_signup_router} from "./vanilla.signup"


export const vanilla_router = Router()

vanilla_router.use("/login",auth_vanilla_login_router)
vanilla_router.use("/signup",auth_vanilla_signup_router)

export default vanilla_router