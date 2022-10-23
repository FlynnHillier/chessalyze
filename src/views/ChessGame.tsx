import {useState,CSSProperties} from 'react'
import PropTypes from 'prop-types'
import { Chessboard } from 'react-chessboard'
import {Chess,Square,Move,Piece} from "chess.js"

const ChessGame = () => {
  const [game,setGame] = useState(new Chess())
  const [customSquareStyles,setCustomSquareStyles] = useState({})
  const [selectedSquare,setSelectedSquare] = useState<null | Square>(null)

  function updateMovementHints(selectedSquare:Square){
    const customCSS : CSSProperties = {
      "backgroundImage":`url('')`,
      "backgroundPosition":"center",
      "backgroundSize":"cover",
      "cursor":"pointer",
      "backgroundColor":"red",
    }
    
    setCustomSquareStyles(()=>{
      let generatedCustomSquareStyles : {[key:string]:CSSProperties} = {}
      for(const move of game.moves({square:selectedSquare}) as string[]){
        generatedCustomSquareStyles[move.slice(-2)] = customCSS
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