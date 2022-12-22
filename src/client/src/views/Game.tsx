import React from 'react'
import "./../styles/layout/game.css"
import ChessInterface from '../components/game/ChessInterface'
const Game = () => {
  return (
    <>
    <div className="game layout-container">
      <div className="game layout-left-sidebar-container">
        {/* <div className="game sidebar">
            Join Game
        </div> */}
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