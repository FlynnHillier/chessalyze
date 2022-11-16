import {Router,NextFunction,Request,Response,urlencoded} from "express"
import bodyParser from "body-parser"

import {api_router} from "./api/api.router"
import {auth_router} from "./auth/auth.router"

export const router = Router()

router.use(bodyParser.json())
router.use(urlencoded({extended:true}))

router.use("/a",api_router)
router.use("/auth",auth_router)

router.use("*",(req,res)=>{
    res.status(404).send("404 - this resource was not found.")
})

router.use((err:any,req:Request,res:Response,next:NextFunction)=>{
    const status = err.status || 500
    const message = process.env.NODE_ENV === "development" ? err.message || "something went wrong." : "something went wrong"

    res
    .status(status)
    .send({status,message})
})

export default router