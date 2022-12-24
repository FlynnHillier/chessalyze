import React, { useEffect, useState } from 'react'
import "./../../styles/connectivity/StatusInterface.css"
import SmoothLoadingSpan from '../loading/SmoothLoadingSpan'
import {RiFileCopyLine} from "react-icons/ri"
import { useGame } from '../../hooks/contexts/useGame'
import { useLobby } from '../../hooks/contexts/useLobby'
import { useAuth } from '../../hooks/contexts/useAuth'

import CreateLobbyButton from './CreateLobbyButton'
import EndLobbyButton from './EndLobbyButton'
import EndGameButton from './EndGameButton'


const ConnectivityStatusInterface = () => {
  const {auth} = useAuth()
  const {gameStatus} = useGame()
  const {lobbyStatus} = useLobby()
 
  let [activityStatus,setActivityStatus] = useState<"idle" | "lobby" | "game">("idle")


  useEffect(()=>{
    setActivityStatus(()=>{
      if(gameStatus.isInGame){
        return "game"
      }
      if(lobbyStatus.isInLobby){
        return "lobby"
      }
      return "idle"
    })
  },[gameStatus.isInGame,lobbyStatus.isInLobby])





  function getOpponent() : null | string{
    if(!gameStatus.isInGame){
      return null
    }

    return gameStatus.gameDetails.players.w === auth.userInfo.id ?
    gameStatus.gameDetails.players.b
    :
    gameStatus.gameDetails.players.w
  }

  function getStatusDisplayText() { //covnerts from activity status state to display text 
    switch(activityStatus) {
      case "idle": {
        return "idle"
      }
      case "lobby": {
        return "awaiting opponent"
      }
      case "game": {
        return "in game"
      }
      default:{
        return "???"
      }
    }
  }

  function getLobbyInviteURL() : string{
    return `${process.env.REACT_APP_BASE_URL}/game/join/${lobbyStatus.lobbyDetails.id}`
  }

  function onCopyInviteLink() : void {
    navigator.clipboard.writeText(getLobbyInviteURL())
  }






  return (
    <div className="connectivity status-interface-container">
       <div className='status-header'>
          <h1>
            status
          </h1>
       </div>
       <div className='status-sub-header'>
          <h3>
          {getStatusDisplayText()}
          </h3>
       </div>
      <div className="status-players">
        <div className="status-players-playertag">
            {`${auth.userInfo.username}`}
        </div>
        <div className="status-players-playertag">
            {
              activityStatus === "game" ?
              getOpponent()
              :
              activityStatus === "lobby" ?
              <SmoothLoadingSpan/>
              :
              ""
            }
        </div>
      </div>
      <div className="status-button-container">
        {
          activityStatus === "game" ?
          <EndGameButton/>
          :
          activityStatus === "lobby" ?
          <EndLobbyButton/>
          :
          <CreateLobbyButton/>

        }
      </div>
      {
        activityStatus === "lobby" ?
        <div className="status-paste-field-container"
          onClick={onCopyInviteLink}
        >
          <div>
              <RiFileCopyLine/>
          </div>
          <div>
              copy invite link
          </div>
        </div>
        :
        <></>
      }
    </div>
  )
}

export default ConnectivityStatusInterface