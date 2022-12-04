import {useState,CSSProperties, useEffect} from 'react'
import {Chessboard} from "react-chessboard"
import PromotionOverlay from './PromotionOverlay'

import {Square, Color} from "chess.js"
import { FEN, PromotionSymbol } from 'chessalyze-common'

import EmptyTileOverlayHint from "./../../assets/overlays/emptyTileHint.png"
import OccupiedTileOverlayHint from "../../assets/overlays/occupiedTileHint.png"

import "./../../styles/game/chessBoard.css"
import GameOverOverlay from './GameOverOverlay'

import { GameConclusion } from '../../types/chessboard'


interface Props {
  proposeMovement:(sourceSquare:Square,targetSquare:Square,{promotion} : {promotion?:PromotionSymbol})=>boolean | Promise<boolean>,
  queryMove:({source,target} : {source:Square,target:Square}) => {valid:boolean,promotion:boolean}
  generateMovementOverlays:({source} : {source:Square}) => {tile:Square, occupied:boolean}[]
  fen:FEN,
  turn:Color,
  summary:GameConclusion | null,
  perspective:Color,
  isActive:boolean,
}


const ChessGame = ({fen,turn,summary,queryMove,proposeMovement,generateMovementOverlays,perspective,isActive} : Props) => {
  const [customSquareStyles,setCustomSquareStyles] = useState({})
  const [selectedSquare,setSelectedSquare] = useState<null | Square>(null)

  const [pendingMovement,setPendingMovement] = useState<null | {source : Square,target:Square}>(null)

  const [isDisplayingPromotionSelect,setIsDisplayingPromotionSelect] = useState<boolean>(false)

  const [isDisplayingGameSummary,setIsDisplayingGameSummary] = useState<boolean>(false)

  const [moveIsProposed,setMoveIsProposed] = useState<boolean>(false)

  
  useEffect(()=>{
    if(summary !== null){
      showGameSummaryOverlay()
    }
  },[summary])

  useEffect(()=>{
    updateMovementHints()
  },[selectedSquare])
  
  

  //### PIECE MOVEMEMENT###
  async function onMovement(source:Square,target:Square) : Promise<boolean> {
    const movementQuery = queryMove({source,target})
    if(!movementQuery.valid){
      return false
    }
    if(!movementQuery.promotion){  
      return await initiateMovement(source,target)
    }
    if(movementQuery.promotion){
      showPromotionOverlay(source,target)
    }
    return false
  }

  function onPromotionSelection(promoteTo:PromotionSymbol){
    if(!pendingMovement){
      return
    }
    initiateMovement(pendingMovement.source,pendingMovement.target,{promotion:promoteTo})
    hidePromotionOverlay()
  }

  async function initiateMovement(sourceSquare:Square,targetSquare:Square,{promotion} : {promotion?:PromotionSymbol} = {}) {
    setMoveIsProposed(true)
    const movementResult = await proposeMovement(sourceSquare,targetSquare,{promotion})
    if(movementResult){
      onSuccessfulMove()
    }
    setMoveIsProposed(false)
    return movementResult
  }

  function onSuccessfulMove(){
    setSelectedSquare(null)
  }

  function updateMovementHints(){
    if(!isActive || selectedSquare === null || perspective !== turn){
      return setCustomSquareStyles({})
    }

    const defaultOverlayCSS : CSSProperties = {
      "backgroundPosition":"center",
      "backgroundSize":"cover",
      "cursor":"pointer"
    }

    setCustomSquareStyles(()=>{
      const movementOverlayMap = generateMovementOverlays({source:selectedSquare})
      let customSquareStyles : {[key:string]:CSSProperties} = {}
      for(let overlay of movementOverlayMap){
        customSquareStyles[overlay.tile] = {...defaultOverlayCSS,backgroundImage: overlay.occupied ? `url('${OccupiedTileOverlayHint}')` : `url('${EmptyTileOverlayHint}')`}
      }
      return customSquareStyles
    })
  }



  //### GAME OVER ###
  function showGameSummaryOverlay(){
    setIsDisplayingGameSummary(true)
  }

  function hideGameSummmaryOverlay(){
    setIsDisplayingGameSummary(false)
  }

  function getCurrentTurnDisplayName(){
    return turn === "w" ? "white" : "black"
  }
  
  //### PROMOTION ###
  function showPromotionOverlay(source:Square,target:Square){
    setPendingMovement({source,target})
    setIsDisplayingPromotionSelect(true)
  }

  function hidePromotionOverlay(){
    setIsDisplayingPromotionSelect(false)
    setPendingMovement(null)
  }


  function clearMovementHints(){
    setCustomSquareStyles({})
  }

  function onDrop(sourceSquare:Square,targetSquare:Square,piece:string) : false {
    onMovement(sourceSquare,targetSquare)
    return false
  }

  function onSquareClick(square:Square){
    if(selectedSquare !== null){
      onMovement(selectedSquare,square)
    }
    setSelectedSquare(square)
  }

  function onPieceDragBegin(piece:string,square:Square){
    setSelectedSquare(square)
  }

  return (
      <>
        <div className="chessboard-container">
          <PromotionOverlay 
            turn={turn}
            isHidden={!isDisplayingPromotionSelect}
            onPieceSelection={onPromotionSelection}
            hideSelf={hidePromotionOverlay}
          />
          <GameOverOverlay 
            conclusionState={summary}
            isHidden={!isDisplayingGameSummary}
            hideSelf={hideGameSummmaryOverlay}
          />
          <Chessboard
            boardOrientation={perspective === "w" ? "white" : "black"}
            arePiecesDraggable={isActive &&!summary && !isDisplayingPromotionSelect && !moveIsProposed}
            customBoardStyle={{}}
            position={fen} 
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            onPieceDragBegin={onPieceDragBegin}
            customSquareStyles={customSquareStyles}
          />
        </div>
      </>
  )
}

ChessGame.propTypes = {}

export default ChessGame