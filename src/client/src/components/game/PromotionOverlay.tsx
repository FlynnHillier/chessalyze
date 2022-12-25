import React,{CSSProperties,useEffect} from 'react'

import { Color, PieceSymbol } from 'chess.js'

import "./../../styles/promotionOverlay.css"

import {pieceImages,PieceImages} from "../../assets/images/chesspieces/index"
import { PromotionSymbol } from 'chessalyze-common'

interface Props {
    isHidden:boolean,
    turn:Color,
    onPieceSelection:(piece:PromotionSymbol) => void,
    hideSelf:Function,
    width:number,
}

const PromotionOverlay = ({isHidden,onPieceSelection,hideSelf,turn,width}:Props) => {
  function generateBannerCSS() : CSSProperties{
      const styling : CSSProperties = {
          "color": turn === "w" ? "white" : "black",
          "backgroundColor":turn === "w" ? "black" : "white",
      }
      return styling
  }


  const displayPieceCodes = ["q","b","r","n"]

  return (
    <div 
      className="chessboard-promotion-overlay-container" 
      style={{
        width:width,
        ...(isHidden ? {display:"none"} : {})
      }}>
      <div className="chessboard-overlay"
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
                  onClick={()=>{onPieceSelection(pieceSymbol as PromotionSymbol)}}
                >
                  <img
                    className="chessboard-promotion-overlay-icon"
                    src={pieceImages[turn][pieceSymbol as keyof PieceImages]}
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