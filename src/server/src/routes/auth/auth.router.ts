import  {Router} from "express"
import {oAuth_router} from "./oAuth/oAuth.router"
import {vanilla_router} from "./vanilla/vanilla"
import {logout_router} from "./logout.router"
import {sessionIsUserless,sessionIsUser} from "../../controllers/sessionOccupancy"


export const auth_router = Router()

auth_router.get("/failure",(req,res)=>{res.send("action failed.")})
auth_router.get("/success",(req,res)=>{res.send("action successfull.")})

auth_router.use("/o",sessionIsUserless,oAuth_router)
auth_router.use("/v",sessionIsUserless,vanilla_router)
auth_router.use("/logout",sessionIsUser,logout_router)

export default auth_router