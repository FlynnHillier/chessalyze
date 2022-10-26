import {useState,CSSProperties} from 'react'
import PropTypes from 'prop-types'
import { Chessboard } from 'react-chessboard'
import {Chess,Square,Move} from "chess.js"

import EmptyTileOverlayHint from "./../assets/overlays/emptyTileHint.png"
import OccupiedTileOverlayHint from "./../assets/overlays/occupiedTileHint.png"


const ChessGame = () => {
  const [game,setGame] = useState(new Chess())
  const [customSquareStyles,setCustomSquareStyles] = useState({})
  const [selectedSquare,setSelectedSquare] = useState<null | Square>(null)

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

  function attemptMove(sourceSquare:Square,targetSquare:Square){
    const result = game.move({from:sourceSquare,to:targetSquare})
    if(result != null){
      clearMovementHints()
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
      <Chessboard 
        position={game.fen()} 
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        onPieceDragBegin={onPieceDragBegin}
        customSquareStyles={customSquareStyles}
      />
  )
}

ChessGame.propTypes = {}

export default ChessGame