import {createContext,ReactNode,useReducer} from "react"
import { UUID } from "chessalyze-common"
import { Chess, Square } from "chess.js"
import { PromotionSymbol } from "chessalyze-common"
import { Color } from "chess.js"
import { GameConclusion } from "../types/chessboard"
import { ChessClock } from "../util/clientClock"

const initialGameStatus = {
    hasPersisted:false,
    isInGame:false,
    gameDetails:{
        colour:"w" as Color,
        players:{
            w:{
                displayName:"",
                id:"" as UUID,
            },
            b:{
                displayName:"",
                id:"" as UUID,
            },
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
    clock:new ChessClock(30000,()=>{}),
    conclusion:null as null | GameConclusion,
    instance:new Chess()
}

export type GameStatus = typeof initialGameStatus

type GameReducerActionGameStatus = GameStatus["gameDetails"] & {fen:string}

export interface GameReducerAction {
    type:"JOIN" | "LOAD" | "END" | "MOVE" | "PERSIST",
    payload:{
        onPersistIsInGame?:boolean,
        gameDetails?:GameReducerActionGameStatus,
        moveDetails?:{
            sourceSquare:Square,
            targetSquare:Square,
            promotion?:PromotionSymbol
        },
        conclusion?:GameConclusion,
        time?:{
            w:number,
            b:number
        }
    }
}

function gameReducer(game:GameStatus,action:GameReducerAction) : GameStatus{
    switch(action.type){
        case "PERSIST":
            if(!action.payload.onPersistIsInGame){
                return {...game,hasPersisted:true}
            }

            const instance = new Chess((action.payload.gameDetails as GameReducerActionGameStatus).fen)

            //set time
            if(action.payload.time !== undefined){
                game.clock.stop()
                game.clock.editDuration("w",action.payload.time.w)
                game.clock.editDuration("b",action.payload.time.b)
                game.clock.switch(true,instance.turn())
                game.clock.start()
            } else {
                game.clock.stop()
                game.clock.editDuration("w",0)
                game.clock.editDuration("b",0)
            }


            return {
                ...game,
                isInGame:true,
                instance:instance,
                gameDetails:{...action.payload.gameDetails} as GameStatus["gameDetails"],
                hasPersisted:true,
            } 
        case "JOIN":
            if(action.payload.time !== undefined){
                game.clock.editDuration("w",action.payload.time.w)
                game.clock.editDuration("b",action.payload.time.b)
                game.clock.switch(false,"w")
                game.clock.start()
            } else {
                game.clock.stop()
                game.clock.editDuration("w",0)
                game.clock.editDuration("b",0)
            }

            return {
                ...game,
                isInGame:true,
                instance:new Chess((action.payload.gameDetails as GameReducerActionGameStatus).fen),
                gameDetails:{...action.payload.gameDetails} as GameStatus["gameDetails"],
            }
        case "END":
            game.clock.stop()
            return {
                ...game,
                isInGame:false,
                conclusion:action.payload.conclusion as GameConclusion,
            }
        case "MOVE":
            if(!action.payload.moveDetails){
                return {...game}
            }

            const initiatingColour = game.instance.turn()
            const movement = game.instance.move({from:action.payload.moveDetails.sourceSquare,to:action.payload.moveDetails.targetSquare,promotion:action.payload.moveDetails.promotion})
            if(movement?.captured){
                game.gameDetails.captured[initiatingColour][movement.captured as PromotionSymbol] ++
            }

            //sync times to server (actual) times; switch client side clock to begin ticking.
            if(action.payload.time !== undefined){
                game.clock.editDuration("w",action.payload.time.w)
                game.clock.editDuration("b",action.payload.time.b)
                game.clock.switch(true,game.instance.turn())
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

