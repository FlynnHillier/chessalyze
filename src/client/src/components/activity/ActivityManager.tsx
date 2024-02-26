import "./../../styles/connectivity/StatusInterface.css"
import { useEffect, useState } from "react"

import { useLobby } from "../../hooks/contexts/useLobby"
import { DynamicActivityButton } from "./ActivityButtons"


export type Activity = "IDLE" | "LOBBY" | "GAME"

export const ActivityManager = () => {
    const {lobby,dispatchLobby} = useLobby()
    let [activity,setActivity] = useState<Activity>("IDLE")

    useEffect(()=>{
        setActivity(()=>{
            if(lobby.present)
                return "LOBBY"
            return "IDLE"
        })
    }, [lobby.present])

    return (
        <DynamicActivityButton activity={activity}/>
    )

}