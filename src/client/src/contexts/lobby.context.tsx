import {createContext,ReactNode,useReducer} from "react"

const initialLobbyStatus = {
    hasPersisted:false,
    isInLobby:false,
    lobbyDetails:{
        id:""
    }
}

type GameStatus = typeof initialLobbyStatus

type LobbyReducerActionLobbyDetails = GameStatus["lobbyDetails"]

export interface GameReducerAction {
    type:"START" | "END" | "PERSIST",
    payload:{
        onPersistIsInLobby?:boolean,
        lobbyDetails?:LobbyReducerActionLobbyDetails,
    }
}

function lobbyReducer(lobby:GameStatus,action:GameReducerAction) : GameStatus{
    switch(action.type){
        case "PERSIST":
            if(!action.payload.onPersistIsInLobby){
                return {...lobby,hasPersisted:true}
            }
            return {
                ...lobby,
                isInLobby:true,
                hasPersisted:true,
                lobbyDetails:{...action.payload.lobbyDetails as LobbyReducerActionLobbyDetails}
            } 
        case "START":
            return {
                ...lobby,
                isInLobby:true,
                lobbyDetails:{...action.payload.lobbyDetails as LobbyReducerActionLobbyDetails}
            } 
        case "END":
            return {...lobby,isInLobby:false,lobbyDetails:initialLobbyStatus.lobbyDetails}
        default:
            return {...lobby}
    }
}

const useProvideLobby = () =>{
    const [lobbyStatus,dispatchLobbyStatus] = useReducer(lobbyReducer,initialLobbyStatus)

    return {
        lobbyStatus,
        dispatchLobbyStatus
    }


}

export const LobbyContext = createContext<ReturnType<typeof useProvideLobby>>({} as ReturnType<typeof useProvideLobby>)

export const LobbyProvider = ({children} : {children:ReactNode}) => {
    const lobby = useProvideLobby()

    return (
        <LobbyContext.Provider value={lobby}>
            {children}
        </LobbyContext.Provider>
    )
}

export default LobbyProvider

