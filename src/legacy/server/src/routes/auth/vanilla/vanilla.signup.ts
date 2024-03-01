import "../../../passport/vanilla"
import { Router} from "express";
import passport from "passport"

export const auth_vanilla_signup_router = Router()

auth_vanilla_signup_router.post("/",passport.authenticate("local-signup",{
    successRedirect:"/auth/success",
    failureRedirect:"/auth/failure"
}))