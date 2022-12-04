import React from 'react'
import { Outlet } from 'react-router-dom'
import GamePersist from '../../components/game/persistors/Game.Persist'

import { useGame } from '../../hooks/contexts/useGame'

const PersistedGameController = () => {
  const {gameStatus} = useGame()
  
  return (
    gameStatus.hasPersisted
      ? <Outlet/>
      : <GamePersist/>
  )
}

export default PersistedGameController