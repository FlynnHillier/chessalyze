import {Router,NextFunction,Request,Response,urlencoded} from "express"
import bodyParser from "body-parser"
import { sessionMiddleware } from "../controllers/sessions"
import passport from "passport"

import {auth_router} from "./auth/auth.router"
import { HttpException } from "../types/errors"
import { corsConfig } from "../init/init.config"
import cors from "cors"
import { trpcExpressMiddleware } from "../routes/trpc/app.trpc"
import { applyWSSHandler } from "@trpc/server/adapters/ws"
import { serverInstance } from "../init/init.server"
import ws from "ws"
import { appRouter } from "../routes/trpc/app.trpc"

export const router = Router()

router.use(cors(corsConfig))
router.use(sessionMiddleware)
router.use(passport.initialize())
router.use(passport.session())
router.use(bodyParser.json())
router.use(urlencoded({extended:true}))

applyWSSHandler({
    wss:new ws.Server({server:serverInstance}),
    router:appRouter,
    createContext:({req,res})=>{
        //TODO: REQ.USER is UNDEFINED
        return {
            user:req.user
        }
    }
})

router.use("/auth",auth_router)
router.use("/t",trpcExpressMiddleware)

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