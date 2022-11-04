import {createContext,ReactNode} from "react"
import io,{Socket} from "socket.io-client"

export const socket = io(process.env.REACT_APP_BASE_URL as string)

export const SocketContext = createContext<Socket>(socket)

export const SocketProvider = ({children} : {children:ReactNode}) => {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketProvider


