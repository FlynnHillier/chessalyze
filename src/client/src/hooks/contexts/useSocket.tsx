import {useContext} from "react"
import { SocketContext } from "../../contexts/socket.context"

export const useSocket = () => {
    return useContext(SocketContext)
}