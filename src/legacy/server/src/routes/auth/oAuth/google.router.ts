import  {Router} from "express"
import passport from "passport"
import "../../../passport/google"

export const google_router = Router()

google_router.get("/",passport.authenticate("google",{scope:["email","profile"]}))
google_router.get("/redirect",passport.authenticate("google",{
    successRedirect:"/auth/success",
    failureRedirect:"/auth/failure"
}))

export default google_router