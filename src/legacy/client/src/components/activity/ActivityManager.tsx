import "./../../styles/connectivity/StatusInterface.css"
import { useEffect, useState } from "react"
import { DynamicActivityButton } from "./ActivityButtons"
import { useLobby } from "../../contexts/lobby.ctx"
import { useGame } from "../../contexts/game.ctx"
import { useAuth } from "../../hooks/contexts/useAuth"
import SmoothLoadingSpan from "../loading/SmoothLoadingSpan"
import { RiFileCopyLine } from "react-icons/ri"



export type Activity = "IDLE" | "LOBBY" | "GAME"

export const ActivityManager = () => {
    const { lobby } = useLobby()
    const { game } = useGame()
    const { auth } = useAuth()

    let [activity,setActivity] = useState<Activity>("IDLE")
    let [activityText,setActivityText] = useState<string>("")
    let [errorMessage, setErrorMessage] = useState<string | undefined>()

    useEffect(()=>{
        setActivity(()=>{
            if(game.present)
                return "GAME"
            if(lobby.present)
                return "LOBBY"
            return "IDLE"
        })
    }, [lobby.present, game.present ])


    useEffect(()=>{
        setActivityText(()=>{
            return activity == "IDLE"
            ? "idling"
            : activity == "LOBBY"
            ? "awaiting opponent"
            : activity == "GAME"
            ? "in game"
            : "???"
        })
    },[activity])

    function getLobbyInviteURL() : string
    {
        return lobby.lobby ? `${window.location.origin}/game/join/${lobby.lobby.id}` : "INVALID"
    }

    function clipboardInviteLink() : void
    {
        navigator.clipboard.writeText(getLobbyInviteURL())
    }

    function getOpponent() : string | null
    {
        if(!game.game)
            return null

        if(auth.userInfo.id == game.game.players.w.id)
            return game.game.players.b.displayName
        if(auth.userInfo.id == game.game.players.b.id)
            return game.game.players.w.displayName
        
        return null
    }


    return (
        <div className="connectivity status-interface-container">
            <div className='status-header'>
                <h1>status</h1>
            </div>
            <div className='status-sub-header'>
                <h3>{activityText}</h3>
                {
                    errorMessage ?
                    <>
                        {errorMessage}
                    </>
                    :
                    <></>
                }
            </div>
            <div className="status-players">
                <div className="status-players-playertag">
                    {`${auth.userInfo.username}`}
                </div>
                <div className="status-players-playertag">
                    {
                        activity === "GAME"
                        ? getOpponent()
                        : activity === "LOBBY"
                        ? <SmoothLoadingSpan/>
                        : ""
                    }
                </div>
            </div>
            <div className="status-button-container">
                <DynamicActivityButton
                    activity={activity}
                    exposeError={setErrorMessage}
                />
            </div>
            {
                activity === "LOBBY" 
                ? ( 
                    <div className="status-paste-field-container" onClick={clipboardInviteLink}>
                        <div>
                            <RiFileCopyLine/>
                        </div>
                        <div>
                            copy invite link
                        </div>
                    </div>
                )
                :
                <></>
            }
        </div>
    )

}