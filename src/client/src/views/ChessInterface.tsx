import React,{useEffect, useState} from 'react'
import ChessGame from '../components/ChessGame'
import { Chess, Square ,Color,Move} from 'chess.js'
import axios from 'axios'
import { socket } from '../contexts/socket.context'
import {UUID,PromotionSymbol,FEN} from "chessalyze-common"


const ChessInterface = () => {
    const [game,_setGame] = useState<Chess>(new Chess())
    const [fen,setFen ] = useState<FEN>(game.fen())
    const [turn,setTurn] = useState<Color>(game.turn())

    socket.on("game:movement",(gameID:UUID,{sourceSquare,targetSquare,promotion} : {sourceSquare:Square,targetSquare:Square,promotion?:PromotionSymbol} )=>{
        game.move({from:sourceSquare,to:targetSquare,promotion:promotion})
        setFen(game.fen())
        setTurn(game.turn())
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
        const targetMove = (game.moves({verbose:true}) as Move[]).find((move)=>{return move.to === target && move.from === source})
        if(!targetMove){
            return {valid:false,promotion:false}
        }
        return {valid:true,promotion:targetMove.promotion !== undefined}
    }

    function generateMovementOverlays({source} : {source:Square}) : {tile:Square,occupied:boolean}[] {
        return (game.moves({square:source,verbose:true}) as Move[]).map((move)=>{return {tile:(move.to as Square),occupied:move.captured !== undefined}})
    }
  
    return (
    <ChessGame
        queryMove={queryMove}
        proposeMovement={proposeMoveToServer}
        fen={fen}
        turn={turn}
        generateMovementOverlays={generateMovementOverlays}
        summary={null}
        perspective={"w"}
    />
  )
}

export default ChessInterface