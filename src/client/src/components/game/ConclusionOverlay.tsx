import React,{useState,useEffect} from 'react'
import "./../../styles/gameOverOverlay.css"
import { ClientGameConclusion } from 'chessalyze-common'
import FancyButton from '../util/FancyButton'

interface Props {
    conclusionState:ClientGameConclusion | null
    isHidden:boolean
    hideSelf:()=>void
    width:number
}

const ConclusionOverlay = ({conclusionState,isHidden,hideSelf,width}:Props) => {  
    let [messageText,setMessageText] = useState<string>("")
    
    function getDisplayText() : string {
        if(!conclusionState){
            return "invalid conclusion."
        }

        let string = "ERROR_UNKNOWN_VICTOR"
        if(conclusionState.victor === "w"){
            string = "white wins"
        }
        if(conclusionState.victor === "b"){
            string = "black wins"
        }
        if(conclusionState.victor === null){
            string = "draw"
        }

        return `${string} by ${conclusionState.termination}`
    }

    useEffect(()=>{
        setMessageText(getDisplayText())
    },[conclusionState])

    return (
        <div className="chessboard-overlay" style={isHidden ? {display:"none"} : {}}
            onClick={(e)=>{
                if(e.target == e.currentTarget){
                    hideSelf()
                }
            }}
        >
            <div className="chessboard-game-over-popup">
                {conclusionState === null ? 
                    <> This game has not yet <br/> concluded.</> : 
                    <>
                        <div className="chessboard-game-over-header"> 
                            <h2>GAME OVER!</h2>
                        </div>
                        <div>
                            {messageText}
                        </div>
                        <div>
                            <FancyButton
                                isLoading={false}
                                text={"close"}
                                onClick={hideSelf}
                            />
                        </div>
                    </>
                }
            </div>    
        </div>
  )
}

export default ConclusionOverlay