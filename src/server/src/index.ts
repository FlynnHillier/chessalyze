import * as dotenv from "dotenv"
dotenv.config({path:"./../../.env"})

import express,{Express} from "express"
import mongoose from "mongoose"
import session from "express-session"
import MongoStore from "connect-mongo"
import {router} from "./routes/router"
import passport from "passport"
import cors from "cors"

import "./types/custom"

import {Server} from "socket.io"
import sockets from "./sockets/index.socket"
import { socketWrapper,sessionMiddleware } from "./controllers/sessions"

const app = express()

async function startServer(port:number,callback:() => void = ()=>{}) {
    try {
        const serverInstance = await app.listen(port,callback)
        return serverInstance
    } catch(err){
        throw {
            message:`an error occured while attempting to begin listening on port '${port}'.`,
            error:err,
        }
    }
}

async function establishMongoConnection(onConnection:()=>void = ()=>{}) : Promise<void> {
    try {
        await mongoose.connect(process.env.MONGO_ACCESS_URI as string)
    } catch(err){
        throw {
            message:`an error occured while attempting to establish a connection with mongoDB.`,
            error:err,
        }
    }
}

function initialiseMongooseConnectionEvents(setConnectionStatus:(value:boolean)=>void) : void {
    mongoose.connection.on("disconnected",()=>{
        setConnectionStatus(false)
    })
    mongoose.connection.on("close",()=>{
        setConnectionStatus(false)
    })
    mongoose.connection.on("connected",()=>{
        setConnectionStatus(true)
    })
    mongoose.connection.on("reconnect",()=>{
        setConnectionStatus(true)
    })
}


function checkEnvVars() : void{
    const requiredEnvKeys = ["PORT","OAUTH_CLIENT_ID","OAUTH_CLIENT_SECRET","MONGO_ACCESS_URI","NODE_ENV"]
    
    const undefinedKeys = []
    for(let key of requiredEnvKeys){
        if(process.env[key] === undefined){
            undefinedKeys.push(key)
        }
    }

    if(undefinedKeys.length !== 0){
        throw `some required enviroment variables are not defined: [ ${undefinedKeys.join(", ")} ]`
    }
}


function initialiseSessionStorage(application:Express){
    application.use(sessionMiddleware)

    application.use(passport.initialize())
    application.use(passport.session())
}


function getCORSconfig() {
    return {
        origin:process.env.NODE_ENV === "development" && process.env.REACT_APP_URL ? process.env.REACT_APP_URL : process.env.HOST_URL,
        credentials:true,
    }
}


async function init(){
    checkEnvVars()
    let mongoIsConnected : boolean = false

    const serverInstance = await startServer(Number(process.env.PORT),()=>{console.log(`now listening on port ${process.env.PORT}`)})
    const io = new Server(serverInstance,{cors:getCORSconfig()})
    
    initialiseSessionStorage(app)
    io.use(socketWrapper(sessionMiddleware))

    initialiseMongooseConnectionEvents((value:boolean)=>{mongoIsConnected = value})
    await establishMongoConnection()

    app.use(cors(getCORSconfig()))
    app.use(router)
    sockets(io)
}


init()