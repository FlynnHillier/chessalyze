import { useEffect } from "react"
import { trpc } from "../../util/trpc"
import FancyButton from "../util/FancyButton"
import { Activity } from "./ActivityManager"
import { useLeaveLobby } from "../../hooks/lobby/useLeaveLobby"
import { useCreateLobby } from "../../hooks/lobby/useCreateLobby"

interface Props {
    exposeError?:(error:string | undefined) => any
}


export const DynamicActivityButton = ({exposeError, activity} : { activity: Activity } & Props) => {
    
    useEffect(()=>{
        if(exposeError)
            exposeError(undefined)
    },[activity])

    return (
        activity == "IDLE"
        ? <CreateLobbyButton exposeError={exposeError}/>
        : activity == "LOBBY"
        ? <LeaveLobbyButton exposeError={exposeError}/>
        : <></>
    )
}


export const CreateLobbyButton = ({exposeError} : Props) => {
    const {error,createLobby,isLoading} = useCreateLobby()

    useEffect(()=>{
        if(exposeError)
            exposeError(error?.message)
    },[error])

    return (
        <FancyButton
            text={"create lobby"}
            isLoading={isLoading}
            onClick={createLobby}
        />
    )
}

export const LeaveLobbyButton = ({exposeError} : Props) => {
    const {error,leaveLobby,isLoading} = useLeaveLobby()
    
    useEffect(()=>{
        if(exposeError)
            exposeError(error?.message)
    },[error])

    return (
        <FancyButton
            text={"leave lobby"}
            isLoading={isLoading}
            onClick={leaveLobby}
        />
    )
}
