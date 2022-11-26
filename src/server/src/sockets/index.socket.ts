import { UUID } from "../types/auth"
import { Server,Socket } from "socket.io"
import { socketWrapper,sessionMiddleware } from "../controllers/sessions"
import passport from "passport"

export const socketMap = new Map()

function onConnection(socket:Socket){
    if(socket.request.user){
        socketMap.set(socket.request.user.uuid,socket)
    }
}

export default (io:Server) => {
    io.use(socketWrapper(sessionMiddleware))
    io.use(socketWrapper(passport.initialize()))
    io.use(socketWrapper(passport.session()))

    io.on("connection",(socket)=>{
        onConnection(socket)
        socket.on("click",()=>{
            console.log(socketMap)
        })
    })
}