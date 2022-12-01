import {createContext,ReactNode,useReducer} from "react"
import { Chess, Square } from "chess.js"
import { PromotionSymbol } from "chessalyze-common"
import { Color } from "chess.js"

const initialGameStatus = {
    isInGame:false,
    gameDetails:{
        colour:"w" as Color,
        players:{
            w:"",
            b:"",
        },
        captured:{
            w:{
                r:0,
                b:0,
                n:0,
                q:0
            },
            b:{
                r:0,
                b:0,
                n:0,
                q:0
            },
        }
    },
    instance:new Chess()
}

type GameStatus = typeof initialGameStatus

export interface GameReducerAction {
    type:"JOIN" | "LOAD" | "END" | "MOVE",
    payload:{
        gameDetails?:GameStatus["gameDetails"] & {fen:string},
        moveDetails?:{
            sourceSquare:Square,
            targetSquare:Square,
            promotion?:PromotionSymbol
        }
    }
}

function gameReducer(game:GameStatus,action:GameReducerAction) : GameStatus{
    switch(action.type){
        case "LOAD":
            if(!action.payload.gameDetails){
                return {...game}
            }
            return {
                isInGame:true,
                instance:new Chess(action.payload.gameDetails.fen),
                gameDetails:{...action.payload.gameDetails}
            }
        case "END":
            return {...initialGameStatus}
        case "MOVE":
            if(!action.payload.moveDetails){
                return {...game}
            }
            const initiatingColour = game.instance.turn()
            const movement = game.instance.move({from:action.payload.moveDetails.sourceSquare,to:action.payload.moveDetails.targetSquare,promotion:action.payload.moveDetails.promotion})
            if(movement?.captured){
                game.gameDetails.captured[initiatingColour][movement.captured as PromotionSymbol] ++
            }
            return {...game}
        default:
            return {...game}
    }
}

const useProvideGame = () =>{
    const [gameStatus,dispatchGameStatus] = useReducer(gameReducer,initialGameStatus)

    return {
        gameStatus,
        dispatchGameStatus
    }


}

export const GameContext = createContext<ReturnType<typeof useProvideGame>>({} as ReturnType<typeof useProvideGame>)

export const GameProvider = ({children} : {children:ReactNode}) => {
    const game = useProvideGame()

    return (
        <GameContext.Provider value={game}>
            {children}
        </GameContext.Provider>
    )
}

export default GameProvider

