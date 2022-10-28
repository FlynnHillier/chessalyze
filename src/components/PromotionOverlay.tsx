import React,{CSSProperties} from 'react'

import { Color, PieceSymbol } from 'chess.js'

import "./../styles/promotionOverlay.css"

import {pieceImages,PieceImages} from "./../assets/images/chesspieces/index"

interface Props {
    isHidden:boolean,
    currentTurn:Color,
    setPromotionSelectionState:Function,
    hideSelf:Function,
}

const PromotionOverlay = ({isHidden,currentTurn,setPromotionSelectionState,hideSelf}:Props) => {
  function generateBannerCSS() : CSSProperties{
      const styling : CSSProperties = {
          "color": currentTurn === "w" ? "white" : "black",
          "backgroundColor":currentTurn === "w" ? "black" : "white",
      }
      return styling
  }

  function onPieceSelection(pieceSymbol:PieceSymbol){
    setPromotionSelectionState(pieceSymbol)
  }


  const displayPieceCodes = ["q","b","r","n"]

  return (
    <div className="chessboard-promotion-overlay-container" style={isHidden ? {"display":"none"} : {}}>
      <div className="chessboard-promotion-overlay"
        onClick={(e)=>{
          if(e.target == e.currentTarget){
            hideSelf()
          }
        }}
      >
        <div className="chessboard-promotion-overlay-banner" style={generateBannerCSS()}>
          {
            displayPieceCodes.map((pieceSymbol)=>{
              return (
                <div className="chessboard-promotion-overlay-icon-frame"
                  onClick={()=>{onPieceSelection(pieceSymbol as PieceSymbol)}}
                >
                  <img
                    className="chessboard-promotion-overlay-icon"
                    src={pieceImages[currentTurn][pieceSymbol as keyof PieceImages]}
                    alt={pieceSymbol}
                  />
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default PromotionOverlay