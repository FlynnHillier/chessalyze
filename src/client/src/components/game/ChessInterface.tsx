import React,{useEffect, useState} from 'react'
import ChessGame from './ChessGame'
import { Chess, Square ,Color,Move} from 'chess.js'
import axios from 'axios'
import { socket } from '../../contexts/socket.context'
import {UUID,PromotionSymbol,FEN} from "chessalyze-common"
import { useGame } from '../../hooks/contexts/useGame'
import "../../styles/game/chessInterface.css"
import PlayerBanner from './PlayerBanner'
import { useObserveElementWidth } from '../../hooks/util/useObserveElementWidth'

const ChessInterface = () => {
    const {gameStatus,dispatchGameStatus} = useGame()
    const {instance} = gameStatus
    let [colourConfiguration,setColourConfiguration] = useState<{native:Color,opponent:Color}>({
        native:"w",
        opponent:"b"
    })

    const { width, ref } = useObserveElementWidth<HTMLDivElement>();

    useEffect(()=>{ //when gameDetails are ammended update native / opposition colour configuration state
        setColourConfiguration({
                native:gameStatus.gameDetails.colour,
                opponent:gameStatus.gameDetails.colour === "w" ? "b" : "w",
            })
    },[gameStatus.gameDetails])

    socket.on("game:movement",(gameID:UUID,{sourceSquare,targetSquare,promotion} : {sourceSquare:Square,targetSquare:Square,promotion?:PromotionSymbol} )=>{
        dispatchGameStatus({type:"MOVE",payload:{moveDetails:{sourceSquare,targetSquare,promotion}}})
    })

    async function proposeMoveToServer(sourceSquare:Square,targetSquare:Square,{promotion} : {promotion?:PromotionSymbol} = {}) : Promise<boolean> {
        try {
            const response = await axios.post("/a/game/move",{
                sourceSquare:sourceSquare,
                targetSquare:targetSquare,
                promotion:promotion || null
            })
            return response.data.result
        } catch(err){
            console.log("error making move.")
            return false
        }
    }

    function queryMove({source,target} : {source:Square,target:Square}) : {valid:boolean,promotion:boolean} {
        const targetMove = (instance.moves({verbose:true}) as Move[]).find((move)=>{return move.to === target && move.from === source})
        if(!targetMove){
            return {valid:false,promotion:false}
        }
        return {valid:true,promotion:targetMove.promotion !== undefined}
    }

    function generateMovementOverlays({source} : {source:Square}) : {tile:Square,occupied:boolean}[] {
        return (instance.moves({square:source,verbose:true}) as Move[]).map((move)=>{return {tile:(move.to as Square),occupied:move.captured !== undefined}})
    }

  
    return (
        <div className="chess-interface-container"
            ref={ref}
        >
            <PlayerBanner
                colour={colourConfiguration.opponent}
                playerName={gameStatus.gameDetails.players[colourConfiguration.opponent] || "---"}
            />
            {/* <div className="chess-interface layout-content"> */}
                <ChessGame
                    isActive={gameStatus.isInGame}
                    queryMove={queryMove}
                    proposeMovement={proposeMoveToServer}
                    fen={gameStatus.instance.fen()}
                    turn={instance.turn()}
                    generateMovementOverlays={generateMovementOverlays}
                    summary={null}
                    perspective={gameStatus.gameDetails.colour}
                    boardWidth={width}
                />
            {/* </div> */}
            <PlayerBanner
                colour={colourConfiguration.native}
                playerName={gameStatus.gameDetails.players[colourConfiguration.native] || "---"}
            />
        </div>
    )
}

export default ChessInterface