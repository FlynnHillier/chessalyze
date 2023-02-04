import React from 'react'
import { Outlet } from 'react-router-dom'
import GamePersist from '../../components/game/persistors/Game.Persist'
import SocketGameEvents from '../../sockets/Socket.GameEvents'

import { useGame } from '../../hooks/contexts/useGame'

const PersistedGameController = () => {
  const {gameStatus} = useGame()
  
  return (
    gameStatus.hasPersisted
      ? <SocketGameEvents><Outlet/></SocketGameEvents>
      : <GamePersist/>
  )
}

export default PersistedGameController