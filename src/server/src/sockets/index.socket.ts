import { UUID } from "chessalyze-common"
import { Server,Socket } from "socket.io"
import { socketWrapper,sessionMiddleware } from "../controllers/sessions"
import passport from "passport"
import { SocketManager } from "./socketManager"

export const socketManagment = new SocketManager()

function onConnection(socket:Socket){
    if(socket.request.user){
        socketManagment.registerConnection(socket.request.user!.uuid,socket)
    }
}

export default (io:Server) => {
    io.use(socketWrapper(sessionMiddleware))
    io.use(socketWrapper(passport.initialize()))
    io.use(socketWrapper(passport.session()))

    io.on("connection",(socket)=>{
        onConnection(socket)
        socket.on("click",()=>{
            console.log(socketManagment)
        })
    })
}