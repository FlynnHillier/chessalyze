import {UUID} from "../types/auth"
import {Chess} from "chess.js"
import {v1 as uuidv1} from "uuid"

import {GameState} from "./gameState"


interface NewGamePlayer {
    uuid:UUID,
    preference: null | "w" | "b"
}

class GameStateManager {
    public gameStates:GameState[]  = []
    
    constructor(){}

    public getPlayerGame(uuid:UUID) : null | GameState {
        const game = this.gameStates.find((game)=>game.players.w === uuid || game.players.b === uuid)
        return game !== undefined ? game : null
    }

    public getGame(gameID:UUID) : null | GameState {
        const game = this.gameStates.find((game)=>game.id === gameID)
        return game !== undefined ? game : null
    }

    public newGame(p1:NewGamePlayer,p2:NewGamePlayer) : GameState {
        const newGameState = new GameState(p1,p2)
        newGameState.setEventCallback("conclusion",()=>{
            this.gameStates.slice(this.gameStates.indexOf(newGameState),1)
        })
        this.gameStates.push(newGameState)
        return newGameState
    }
}