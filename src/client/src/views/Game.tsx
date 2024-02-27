import React from 'react'
import "./../styles/layout/game.css"
import ChessInterface from '../components/game/ChessInterface'
// import ConnectivityStatusInterface from '../components/activity/ConnectivityStatusInterface'
import { ActivityManager } from '../components/activity/ActivityManager'

const Game = () => {
  return (
    <>
    <div className="game layout-container">
      <div className="game layout-left-sidebar-container">
        {/* <ConnectivityStatusInterface/> */}
        <ActivityManager/>
      </div>
      <div className="game layout-content">
        <ChessInterface/>
      </div>
      <div className="game layout-right-sidebar-container">

      </div>
    </div>
    </>
  )
}

export default Game