import * as dotenv from "dotenv"
dotenv.config({path:"./../../.env"})
import { checkEnvVariables } from "./init.config"
checkEnvVariables()

import {app} from "./init.server"
import {io} from "./init.socket"
import { establishMongoConnection } from "./init.mongoose"

import {router} from "../routes/router"
import socketRouter from "../sockets/index.socket"


export async function init(silent = false) {
    await establishMongoConnection(process.env.MONGO_ACCESS_URI as string)
    if(!silent)
    console.log("established connection to mongo DB")

    socketRouter(io)
    if(!silent)
    console.log("socket server up")

    app.use(router)
}
