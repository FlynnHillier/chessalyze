import { Request,Response,NextFunction, Router } from "express"
import {GameManager} from "../../../game/game"
import { GameState } from "../../../game/gameState"
import { validateSchema } from "../../../controllers/schemaValidation"
import { Schema,CustomValidator } from "express-validator"
import { Square } from "chess.js"
import {io} from "./../../../init/init.socket"
import { PromotionSymbol } from "chessalyze-common"


const isValidPromotion : CustomValidator = (v:any) => {
    return [
        null,
        "r",
        "n",
        "b",
        "q"
    ].includes(v)
} 

const isValidTile : CustomValidator = (v:any) => {
    if(v.length != 2){
        return false
    }

    if(!["a","b","c","d","e","f","g","h"].includes(v[0])){
        return false
    }

    if(!["1","2","3","4","5","6","7","8"].includes(v[1])){
        return false
    }

    return true
}

const schema : Schema = {
    sourceSquare:{
        isString:true,
        custom:{
            options:isValidTile
        }
    },
    targetSquare:{
        isString:true,
        custom:{
            options:isValidTile
        }
    },
    promotion:{
        custom:{
            options:isValidPromotion
        }
    }
}

const gameMove = (req:Request,res:Response,next:NextFunction) => {
        const gameState = GameManager.getPlayerGame(req.user!.uuid) as GameState
        const targetSquare = req.body.targetSquare as Square
        const sourceSquare = req.body.sourceSquare as Square
        const promotion = req.body.promotion !== null ? req.body.promotion as PromotionSymbol : undefined

        if(!gameState.isPlayerTurn(req.user!.uuid)){
            return res.send({result:false})
        }
        if(gameState.isValidMove(sourceSquare,targetSquare,promotion)){ //if move is valid
            gameState.move(sourceSquare,targetSquare,promotion) //commit move to game
            io.to(`game:${gameState.id}`).emit("game:movement",gameState.id,{sourceSquare,targetSquare,promotion})
            res.send({result:true})
        } else{
            res.send({result:false})
        }
    }


export default Router().use(validateSchema(schema),gameMove)