import {UUID} from "../types/auth"
import {v1 as uuidv1} from "uuid"

import {GameState} from "./gameState"
import { GameLobby } from "../types/game"


interface NewGamePlayer {
    uuid:UUID,
    preference: null | "w" | "b"
}

export class GameStateManager {
    public gameStates:GameState[]  = []
    public gameLobbys : GameLobby[] = []
    
    constructor(){}

    public getPlayerGame(uuid:UUID) : null | GameState {
        const game = this.gameStates.find((game)=>game.players.w === uuid || game.players.b === uuid)
        return game !== undefined ? game : null
    }

    public getGame(gameID:UUID) : null | GameState {
        const game = this.gameStates.find((game)=>game.id === gameID)
        return game !== undefined ? game : null
    }

    public newGame(p1:NewGamePlayer,p2:NewGamePlayer,uuid?:string) : GameState {
        const newGameState = new GameState(p1,p2)
        newGameState.setEventCallback("conclusion",()=>{
            this.gameStates.slice(this.gameStates.indexOf(newGameState),1)
        })
        this.gameStates.push(newGameState)
        return newGameState
    }

    public getPlayerLobby(uuid:UUID) : null | GameLobby {
        const lobby = this.gameLobbys.find((lobby)=>lobby.playerID === uuid)
        return lobby === undefined ? null : lobby
    }

    public getLobby(lobbyID:UUID) : null | GameLobby {
        const lobby = this.gameLobbys.find((lobby)=>lobby.lobbyID === lobbyID)
        return lobby === undefined ? null : lobby 
    }   

    public createLobby(playerID:UUID) : GameLobby {
        const existingLobby = this.getPlayerLobby(playerID)
        if(existingLobby !== null){ //if player is already in lobby return that lobby
            return existingLobby
        }
        const newLobby : GameLobby = { //create new lobby
            playerID:playerID,
            lobbyID:uuidv1()
        }
        this.gameLobbys.push(newLobby)
        return newLobby
    }

    public joinLobby(lobbyID:UUID,joiningPlayerID:UUID) : GameState | null {
        const lobby = this.getLobby(lobbyID)
        if(lobby === null){
            return null
        }
        this.endLobby(lobby.lobbyID) //on join cease lobby existence as game is created.
        return this.newGame({uuid:lobby.playerID,preference:null},{uuid:joiningPlayerID,preference:null})
    }

    public endLobby(lobbyID:UUID) : void {
        const lobby = this.getLobby(lobbyID)
        if(lobby !== null){
            this.gameLobbys.splice(this.gameLobbys.indexOf(lobby),1)
        }
    }
}