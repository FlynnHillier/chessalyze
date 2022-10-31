import {Router} from "express"

export const logout_router = Router()

logout_router.get("/",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err)
        }
        res.redirect("/")
    })
})

export default logout_router