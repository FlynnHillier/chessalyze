import * as dotenv from "dotenv"
dotenv.config({path:"./../../.env"})

import express,{Express} from "express"
import mongoose from "mongoose"
import session from "express-session"
import MongoStore from "connect-mongo"
import {router} from "./routes/router"
import passport from "passport"

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
    application.use(session({
        secret:"secret!",
        saveUninitialized:true,
        resave: true,
        cookie:{
            sameSite: false,
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 14,
        },
        store:MongoStore.create({
            mongoUrl:process.env.MONGO_ACCESS_URI,
            ttl: 60 * 60 * 24 * 14,
            autoRemove:"interval",
            autoRemoveInterval:10,
        }),
    }))

    app.use(passport.initialize())
    app.use(passport.session())
}


async function init(){
    checkEnvVars()
    let mongoIsConnected : boolean = false

    const server = await startServer(Number(process.env.PORT),()=>{console.log(`now listening on port ${process.env.PORT}`)})

    initialiseMongooseConnectionEvents((value:boolean)=>{mongoIsConnected = value})
    await establishMongoConnection()
    initialiseSessionStorage(app)

    app.use(router)
}


init()