import React,{useEffect, useState} from 'react'
import ChessGame from '../components/ChessGame'
import { Chess, Square ,Color,Move} from 'chess.js'
import axios from 'axios'
import { socket } from '../contexts/socket.context'
import {UUID,PromotionSymbol,FEN} from "chessalyze-common"
import { useGame } from '../hooks/useGame'

const ChessInterface = () => {
    const {gameStatus,dispatchGameStatus} = useGame()
    const {instance} = gameStatus


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
    <ChessGame
        isActive={gameStatus.isInGame}
        queryMove={queryMove}
        proposeMovement={proposeMoveToServer}
        fen={gameStatus.instance.fen()}
        turn={instance.turn()}
        generateMovementOverlays={generateMovementOverlays}
        summary={null}
        perspective={gameStatus.gameDetails.colour}
    />
  )
}

export default ChessInterface