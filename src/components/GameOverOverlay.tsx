import React from 'react'
import PropTypes from 'prop-types'

import "./../styles/gameOverOverlay.css"

import {GameConclusion} from "./../types/chessboard"

interface Props {
    conclusionState:GameConclusion | null
    isHidden:boolean
    hideSelf:Function
}

const GameOverOverlay = (props:Props) => {  
    return (
        <div className="chessboard-overlay" style={props.isHidden ? {display:"none"} : {}}
            onClick={(e)=>{
                if(e.target == e.currentTarget){
                props.hideSelf()
                }
            }}
        >
            <div className="chessboard-game-over-popup">
                {props.conclusionState === null ? 
                    <> This game has not yet <br/> concluded.</> : 
                    <>
                        <div className=".chessboard-game-over-header"> 
                            <h2>GAME OVER!</h2>
                        </div>
                        <div>
                            <text>{props.conclusionState.type} {props.conclusionState.type !== "draw" ? "wins" : ""}</text>
                            <br/>
                            <text>by {props.conclusionState.reason}</text>
                        </div>
                        <div>
                            <button onClick={()=>{props.hideSelf()}}>
                                close
                            </button>
                        </div>
                    </>
                }
            </div>    
        </div>
  )
}

GameOverOverlay.propTypes = {}

export default GameOverOverlay