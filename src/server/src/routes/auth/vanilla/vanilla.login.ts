import "../../../passport/vanilla"
import { Router} from "express";
import passport from "passport"


export const auth_vanilla_login_router = Router()

auth_vanilla_login_router.post("/",passport.authenticate("local-login",{
    successRedirect:"/auth/success",
    failureRedirect:"/auth/failure"
}))