import { UUID } from "@common/src/types/misc"
import { ReducerAction } from "../types/context.types"
import { createContext, useEffect, useReducer } from "react"
import { ReactNode } from "react"
import { trpc } from "../util/trpc"


export interface LOBBYCONTEXT {
    present:boolean,
    lobby?:{
        id:string
    }
}

const defaultContext : LOBBYCONTEXT = {
    present:false,
    lobby:undefined,
}

type RdcrActnLoad = ReducerAction<"LOAD",LOBBYCONTEXT>

type RdcrActnStart = ReducerAction<"START",{
    lobby:{
        id:UUID
    }
}>

type RdcrActnEnd = ReducerAction<"END",{}>


type LobbyRdcrActn = RdcrActnLoad | RdcrActnStart | RdcrActnEnd


function reducer<A extends LobbyRdcrActn>(state:LOBBYCONTEXT,action:A) : LOBBYCONTEXT {
    const {type, payload} = action
    
    switch(type)
    {
        case "LOAD":
            return payload
        case "START":
            return {
                present:true,
                lobby:{
                    id:payload.lobby.id
                }
            }
        case "END":
            return {
                present:false,
                lobby:undefined
            }
        default:
            return {...state}
    }
}

export const useProvideLobby = () => {
    const [lobby,dispatchLobby] = useReducer(reducer,defaultContext)

    return {
        lobby,
        dispatchLobby
    }
}

export const LobbyContext = createContext<ReturnType<typeof useProvideLobby>>({} as ReturnType<typeof useProvideLobby>)

export const LobbyProvider = ({children} : {children : ReactNode}) => {
    const context = useProvideLobby()
    const query = trpc.a.lobby.status.useQuery()

    useEffect(()=>{
        console.log(query.isLoading)
        if (query.isFetched && query.data)
        {
            context.dispatchLobby({
                type:"LOAD",
                payload:query.data,
            })
        }
    }, [query.isLoading])

    return (
        <LobbyContext.Provider value={context}>
            {children}
        </LobbyContext.Provider>
    )
}