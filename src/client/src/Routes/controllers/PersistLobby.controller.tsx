import React from 'react'
import { Outlet } from 'react-router-dom'
import LobbyPersist from '../../components/game/persistors/Lobby.Persist'
import { useLobby } from '../../hooks/contexts/useLobby'

const PersistedLobbyController = () => {
  const {lobbyStatus} = useLobby()
  
  return (
    lobbyStatus.hasPersisted
      ? <Outlet/>
      : <LobbyPersist/>
  )
}

export default PersistedLobbyController