import {useState,CSSProperties, useEffect, useCallback} from 'react'
import {Chessboard} from "react-chessboard"
import PromotionOverlay from './PromotionOverlay'

import {Square, Color} from "chess.js"
import { FEN, PromotionSymbol } from '@common/src/types/game'

import EmptyTileOverlayHint from "./../../assets/overlays/emptyTileHint.png"
import OccupiedTileOverlayHint from "../../assets/overlays/occupiedTileHint.png"

import "./../../styles/game/chessBoard.css"
import ConclusionOverlay from './ConclusionOverlay'
import {Chess, Move} from "chess.js"
import { trpc } from '../../util/trpc'


type Movement = {
  source:Square,
  target:Square,
  promotion?:PromotionSymbol,
}



interface Props {
  instance:Chess,
  perspective:Color,
  allowMovement:boolean,
  style:{
    width:number,
  }
}


const ChessGame = ({instance, perspective, allowMovement, style} : Props) => {
  const [customSquareStyles,setCustomSquareStyles] = useState({})
  const [selectedSquare,setSelectedSquare] = useState<null | Square>(null)
  const [pendingMovement,setPendingMovement] = useState<null | Movement>(null)
  const [isDisplayingPromotionSelect,setIsDisplayingPromotionSelect] = useState<boolean>(false)

  const movementMutation = trpc.a.game.move.useMutation()

  const getMovementHints = useCallback(()=>{
    if(!selectedSquare)
      return {};
    
    const getCSS = (occupied:boolean) => {
      return {
        "backgroundPosition":"center",
        "backgroundSize":"cover",
        "cursor":"pointer",
        "backgroundImage": occupied ? `url('${OccupiedTileOverlayHint}')` : `url('${EmptyTileOverlayHint}')`
      }
    }

    (instance.moves({verbose:true, square:selectedSquare}) as Move[]).reduce((acc,{to, captured}) => {
      return {...acc, [to]:getCSS(captured != null)}
    },{} as {[key in Square] : CSSProperties})
  },[selectedSquare])

  //## Movement
  function onDrop(sourceSquare:Square,targetSquare:Square,piece:string) : false {
    attemptMovement({
      source:sourceSquare,
      target:targetSquare,
    })
    return false
  }

  function onDragBegin(_:any,square:Square)
  {
    setSelectedSquare(square)
  }

  function onSquareClick(square:Square){
    if(selectedSquare){
      attemptMovement({
        source:selectedSquare,
        target:square
      })
    }
    setSelectedSquare(square)
  }

  function attemptMovement({source,target,promotion} : Movement) : void
  {
    if(!allowMovement)
      return
    
    const moves = (instance.moves({verbose:true})) as Move[]
    const move = moves.find(m => m.from == source && m.to == target)

    if (!move)
      return

    if(move.promotion && !promotion)
      return awaitPromotionSelection({source,target})

    movementMutation.mutate({
      move:{
        source:source,
        target:target,
      },
      promotion:promotion
    })
  }


  //## Promotion
  function onPromotionSelection(promotion:PromotionSymbol) : void
  {
      if(pendingMovement)
      {
        attemptMovement({...pendingMovement, promotion})
      }
  }

  function awaitPromotionSelection(pendingMovement: Movement)
  {
    setPendingMovement(pendingMovement)
    setIsDisplayingPromotionSelect(true)
  }

  function showPromotionSelection()
  {
    setIsDisplayingPromotionSelect(true)
  }

  function hidePromotionSelection()
  {
    setIsDisplayingPromotionSelect(false)
    setPendingMovement(null)
  }



  //### GAME OVER ###

  function getCurrentTurnDisplayName(){
    return instance.turn() === "w" ? "white" : "black"
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


  return (
      <>
        <div className="chessboard-container">
          <PromotionOverlay 
            turn={instance.turn()}
            isHidden={!isDisplayingPromotionSelect}
            onPieceSelection={onPromotionSelection}
            hideSelf={hidePromotionOverlay}
            width={style.width}
          />
          <ConclusionOverlay 
            width={style.width}
            conclusionState={null}
            isHidden={true}
            hideSelf={()=>{}}
          />
          <Chessboard
            boardWidth={style.width}
            boardOrientation={perspective === "w" ? "white" : "black"}
            arePiecesDraggable={!movementMutation.isLoading && allowMovement}
            customBoardStyle={{}}
            position={instance.fen()} 
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            onPieceDragBegin={onDragBegin}
            customSquareStyles={getMovementHints()}
          />
        </div>
      </>
  )
}

ChessGame.propTypes = {}

export default ChessGame