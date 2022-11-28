import  {Router,Request,Response, NextFunction} from "express"

export const api_user_getName = Router()



api_user_getName.get("/",(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).send({user:req.user?.name || null})
})


export default api_user_getName