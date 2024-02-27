import { UUID } from "@common/src/types/misc"
import { ReducerAction } from "../types/context.types"
import { Dispatch, createContext, useContext, useEffect, useReducer } from "react"
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


const LobbyContext = createContext({} as {
    lobby:LOBBYCONTEXT,
    dispatchLobby:Dispatch<LobbyRdcrActn>
})

export function useLobby()
{
    return useContext(LobbyContext)
}

export const LobbyProvider = ({children} : {children : ReactNode}) => {
    const [lobby,dispatchLobby] = useReducer(reducer,defaultContext)
    const query = trpc.a.lobby.status.useQuery()

    useEffect(()=>{
        if (query.isFetched && query.data)
        {
            dispatchLobby({
                type:"LOAD",
                payload:query.data,
            })
        }
    }, [query.isLoading])

    return (
        <LobbyContext.Provider value={{lobby, dispatchLobby}}>
            {children}
        </LobbyContext.Provider>
    )
}