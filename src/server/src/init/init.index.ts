import * as dotenv from "dotenv"
dotenv.config({path:"./../../.env"})
import { checkEnvVariables } from "./init.config"
checkEnvVariables()

import {app} from "./init.server"
import {io} from "./init.socket"
import { establishMongoConnection } from "./init.mongoose"

import {router} from "../routes/router"
import socketRouter from "../sockets/index.socket"


export function init() {
    establishMongoConnection(process.env.MONGO_ACCESS_URI as string)
    app.use(router)
    socketRouter(io)
}
