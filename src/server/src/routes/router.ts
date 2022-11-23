import {Router,NextFunction,Request,Response,urlencoded} from "express"
import bodyParser from "body-parser"

import {api_router} from "./api/api.router"
import {auth_router} from "./auth/auth.router"
import { HttpException } from "../types/errors"

export const router = Router()

router.use(bodyParser.json())
router.use(urlencoded({extended:true}))

router.use("/a",api_router)
router.use("/auth",auth_router)

router.use("*",(req,res)=>{
    res.status(404).send("404 - this resource was not found.")
})

router.use((err:HttpException,req:Request,res:Response,next:NextFunction)=>{
    const error = {
        message:process.env.NODE_ENV === "development" || err.status < 500 ? err.message : "something went wrong" ,
        code:err.code,
        meta:{...err,status:undefined,message:undefined,code:undefined}
    }

    res
    .status(err.status || 500)
    .send(error)
})

export default router