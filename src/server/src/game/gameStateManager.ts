import {UUID} from "chessalyze-common"
import {v1 as uuidv1} from "uuid"

import {GameState} from "./gameState"
import { GameLobby } from "../types/game"
import {socketMap} from "../sockets/index.socket"
import { Socket } from "socket.io"
import {io} from "./../init/init.socket"
import { NewGamePlayer } from "./gameState"

export class GameStateManager {
    public gameStates:GameState[]  = []
    public gameLobbys : GameLobby[] = []
    
    constructor(){}

    public getPlayerGame(uuid:UUID) : null | GameState {
        const game = this.gameStates.find((game)=>game.players.w.id === uuid || game.players.b.id === uuid)
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

        this._getPlayerSocket(p1.uuid).join(`game:${newGameState.id}`)
        this._getPlayerSocket(p2.uuid).join(`game:${newGameState.id}`)

        io.to(`game:${newGameState.id}`).emit("game:joined",
        {
            id:newGameState.id,
            players:newGameState.players,
            captured:{
                w:newGameState.getCaptured("w"),
                b:newGameState.getCaptured("b")
            },
            colours:{
                [newGameState.players.w.id]:"w",
                [newGameState.players.b.id]:"b"
            },
            fen:newGameState.getFEN(),
        }
        )

        this.gameStates.push(newGameState)
        return newGameState
    }

    public getPlayerLobby(uuid:UUID) : null | GameLobby {
        const lobby = this.gameLobbys.find((lobby)=>lobby.player.id === uuid)
        return lobby === undefined ? null : lobby
    }

    public getLobby(lobbyID:UUID) : null | GameLobby {
        const lobby = this.gameLobbys.find((lobby)=>lobby.id === lobbyID)
        return lobby === undefined ? null : lobby 
    }   

    public createLobby(player: {id:UUID,displayName:string}) : GameLobby {
        const newLobby : GameLobby = { //create new lobby
            player:{
                id:player.id,
                displayName:player.displayName
            },
            id:uuidv1()
        }
        this._getPlayerSocket(player.id).join(`lobby:${newLobby.id}`)
        io.to(`lobby:${newLobby.id}`).emit("lobby:joined",newLobby.id)
        
        this.gameLobbys.push(newLobby)
        return newLobby
    }

    public joinLobby(lobbyID:UUID,joiningPlayer:{id:UUID,displayName:string}) : GameState | null {
        const lobby = this.getLobby(lobbyID)
        if(lobby === null){
            return null
        }
        this.endLobby(lobby.id) //on join cease lobby existence as game is created.
        return this.newGame({uuid:lobby.player.id,preference:null,displayName:lobby.player.displayName},{uuid:joiningPlayer.id,displayName:joiningPlayer.displayName,preference:null})
    }

    public endLobby(lobbyID:UUID) : void {
        const lobby = this.getLobby(lobbyID)
        if(lobby !== null){
            this.gameLobbys.splice(this.gameLobbys.indexOf(lobby),1)
            const playerSocket = this._getPlayerSocket(lobby.player.id)
            io.to(`lobby:${lobby.id}`).emit("lobby:ended",lobby.id)
            playerSocket.leave(`lobby:${lobby.id}`)
        }
    }

    public playerIsInLobby(playerID:UUID) : boolean {

        return this.getPlayerLobby(playerID) === null
    }

    private _getPlayerSocket(playerUUID:UUID) : Socket {
        return socketMap.get(playerUUID) as Socket
    }
}