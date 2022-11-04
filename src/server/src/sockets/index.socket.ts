import { Server } from "socket.io"


export default (io:Server) => {
    io.on("connection",(socket)=>{
        console.log(`hello new person ${socket.id}`)

        socket.on("click",()=>{
            console.log(socket.request.session)
            console.log("he clicked")
        })

    })
}