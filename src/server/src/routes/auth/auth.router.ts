import  {Router} from "express"
import {oAuth_router} from "./oAuth/oAuth.router"
import {vanilla_router} from "./vanilla/vanilla"
import {logout_router} from "./logout.router"
import {sessionIsUserless,sessionIsUser} from "../../controllers/sessionOccupancy"
import {auth_status_router} from "./auth.status"


export const auth_router = Router()

auth_router.get("/failure",(req,res)=>{
    res.send({
        result:false
    })
})

auth_router.get("/success",(req,res)=>{
    res.send({
        result:true,
        userInfo:{
            email:req.user!.email ? req.user!.email : "",
            username:req.user!.name,
            id:req.user!.uuid
        }
    })
})

auth_router.use("/o",sessionIsUserless,oAuth_router)
auth_router.use("/v",sessionIsUserless,vanilla_router)
auth_router.use("/logout",sessionIsUser,logout_router)
auth_router.use("/status",auth_status_router)

export default auth_router