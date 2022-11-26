import { Server } from "socket.io"
import { corsConfig } from "./init.config"
import { serverInstance } from "./init.server"


const createSocketInstance = () : Server => {
    return new Server(serverInstance,{cors:corsConfig})
}

export const io = createSocketInstance()

