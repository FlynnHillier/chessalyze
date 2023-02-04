import React from 'react'
import { Image } from 'react-bootstrap'
import pieceImages from '../../assets/images/chesspieces'
import { Color } from 'chess.js'

interface Props {
    colour:Color,
    playerName:string | null,
    time?:number
}


const PlayerBanner = ({colour,playerName,time}:Props) => {
  
    return (
    <div className="chess-interface layout-player-strip">
            <div className={`chess-interface player-banner ${colour === "w" ? "white" : "black"}`}>
                <div className='image-container'>
                    <Image thumbnail={true} src={pieceImages[colour].k}/>
                </div>
                <div className='text-container'>
                    {playerName || "---"} 
                </div>
            </div>
            <div className="timer">
                {time}
            </div>
        </div>
  )
}

export default PlayerBanner