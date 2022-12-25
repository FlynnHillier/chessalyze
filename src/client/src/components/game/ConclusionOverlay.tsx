import React from 'react'
import "./../../styles/gameOverOverlay.css"
import {GameConclusion} from "../../types/chessboard"
import FancyButton from '../util/FancyButton'

interface Props {
    conclusionState:GameConclusion | null
    isHidden:boolean
    hideSelf:()=>void
    width:number
}

const ConclusionOverlay = (props:Props) => {  
    return (
        <div className="chessboard-overlay" style={props.isHidden ? {display:"none"} : {}}
            onClick={(e)=>{
                if(e.target == e.currentTarget){
                    props.hideSelf()
                }
            }}
        >
            <div className="chessboard-game-over-popup"
                // style={{
                //     width:props.width,
                // }}
            >
                {props.conclusionState === null ? 
                    <> This game has not yet <br/> concluded.</> : 
                    <>
                        <div className="chessboard-game-over-header"> 
                            <h2>GAME OVER!</h2>
                        </div>
                        <div>
                            <text>{props.conclusionState.type} {props.conclusionState.type !== "draw" ? "wins" : ""}</text>
                            <br/>
                            <text>by {props.conclusionState.reason}</text>
                        </div>
                        <div>
                            <FancyButton
                                isLoading={false}
                                text={"close"}
                                onClick={props.hideSelf}
                            />
                        </div>
                    </>
                }
            </div>    
        </div>
  )
}

export default ConclusionOverlay