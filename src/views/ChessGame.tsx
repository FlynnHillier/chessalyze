import {useState,CSSProperties, useEffect} from 'react'
import PropTypes from 'prop-types'
import {Chessboard} from "react-chessboard"
import PromotionOverlay from '../components/PromotionOverlay'
import {Chess,Square,Move,PieceSymbol, Color} from "chess.js"

import EmptyTileOverlayHint from "./../assets/overlays/emptyTileHint.png"
import OccupiedTileOverlayHint from "./../assets/overlays/occupiedTileHint.png"

import "./../styles/chessBoard.css"

const ChessGame = () => {
  const [game,setGame] = useState(new Chess())
  const [customSquareStyles,setCustomSquareStyles] = useState({})
  const [selectedSquare,setSelectedSquare] = useState<null | Square>(null)

  const [isDisplayingPromotionSelect,setIsDisplayingPromotionSelect] = useState<boolean>(false)
  const [selectedPromotionPiece,setSelectedPromotionPiece] = useState<null | PieceSymbol>(null)

  const [pendingPromotionMove,setPendingPromotionMove] = useState<null | {sourceSquare:Square,targetSquare:Square}>(null)

  const [currentTurn,setCurrentTurn] = useState<Color>("w")

  
  //### PROMOTION ###
  function doesRequirePromotion(sourceSquare:Square,targetSquare:Square) : boolean{
    const moves : Array<Move>= game.moves({verbose:true,square:sourceSquare}) as Move[]

    return moves.filter((verboseMove:Move)=>{ return  verboseMove.to === targetSquare && verboseMove.promotion !== undefined}).length !== 0
  }

  function onPromotionSelection(){    
    if(pendingPromotionMove === null || selectedPromotionPiece === null){
      console.log("error - early return onPromotionSelect()")
      return
    }
    const result = attemptMove(pendingPromotionMove!.sourceSquare,pendingPromotionMove!.targetSquare,{promotion:selectedPromotionPiece})
    hidePromotionOverlay()
  }


  function showPromotionOverlay(sourceSquare:Square,targetSquare:Square){
    setPendingPromotionMove({sourceSquare:sourceSquare,targetSquare:targetSquare})
    setIsDisplayingPromotionSelect(true)
  }

  function hidePromotionOverlay(){
    setIsDisplayingPromotionSelect(false)
    setPendingPromotionMove(null)
    setSelectedPromotionPiece(null)
  }

  useEffect(()=>{
    onPromotionSelection()
  },[selectedPromotionPiece])


  //### PIECE MOVEMEMENT###

  function updateMovementHints(selectedSquare:Square){
    const defaultOverlayCSS : CSSProperties = {
      "backgroundImage":`url('${EmptyTileOverlayHint}')`,
      "backgroundPosition":"center",
      "backgroundSize":"cover",
      "cursor":"pointer"
    }
    
    setCustomSquareStyles(()=>{
      let generatedCustomSquareStyles : {[key:string]:CSSProperties} = {}
      for(const move of game.moves({square:selectedSquare,verbose:true}) as Move[]){
        generatedCustomSquareStyles[move.to] = {...defaultOverlayCSS}
        if(game.get(move.to as Square)){
          generatedCustomSquareStyles[move.to].backgroundImage = `url('${OccupiedTileOverlayHint}')`
        }
      }
      return generatedCustomSquareStyles
    })
  }

  function clearMovementHints(){
    setCustomSquareStyles({})
  }

  function attemptMove(sourceSquare:Square,targetSquare:Square,{promotion} : {promotion?:PieceSymbol} = {}){
    if(!promotion && doesRequirePromotion(sourceSquare,targetSquare)){
      showPromotionOverlay(sourceSquare,targetSquare)
      return null
    }
    
    const result = game.move({from:sourceSquare,to:targetSquare,promotion:promotion})
    if(result != null){
      clearMovementHints()
      setCurrentTurn(game.turn())
    }
    return result
  }

  function onDrop(sourceSquare:Square,targetSquare:Square,piece:string){
    return attemptMove(sourceSquare,targetSquare) != null
  }

  function onSquareClick(square:Square){
    if(selectedSquare!=null){
      attemptMove(selectedSquare,square)
    }
    
    setSelectedSquare(square)
    updateMovementHints(square)
  }

  function onPieceDragBegin(piece:string,square:Square){
    updateMovementHints(square)
  }


  return (
      <>
        <div className="chessboard-container">
          <PromotionOverlay 
            isHidden={!isDisplayingPromotionSelect}
            currentTurn={currentTurn}
            setPromotionSelectionState={setSelectedPromotionPiece}
            hideSelf={hidePromotionOverlay}
          />
          <Chessboard
            customBoardStyle={{}}
            position={game.fen()} 
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