import {Router} from "express"

export const auth_status_router = Router()

auth_status_router.get("/",(req,res,next)=>{
    if(!req.user){
        return res.send({authenticated:false})
    } else{
        return res.send({
            authenticated:true,
            userInfo:{
                email:req.user!.email ? req.user!.email : "",
                username:req.user!.name,
                id:req.user!.uuid
            }
        })
    }
})

export default auth_status_router