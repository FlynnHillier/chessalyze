import React from 'react'
import { Outlet } from 'react-router-dom'
import LobbyPersist from '../../components/game/Lobby.Persist'
import { useLobby } from '../../hooks/useLobby'

const PersistedLobbyController = () => {
  const {lobbyStatus} = useLobby()
  
  return (
    lobbyStatus.hasPersisted
      ? <Outlet/>
      : <LobbyPersist/>
  )
}

export default PersistedLobbyController