import {v1 as uuidv1} from "uuid"

import { GameInstance } from "./GameInstance"
import { GameLobby } from "../types/game"
import {socketManagment} from "../sockets/index.socket"
import {io} from "../init/init.socket"
import { NewGamePlayer } from "./GameInstance"

import { GameTerimation } from "./game.end"

import { UUID } from "@common/src/types/misc"

import { createGameRoom, destroyGameRoom } from "../ws/rooms/game.room.ws"
import { emitGameEndEvent } from "../ws/events/game/game.end.event.ws"
import { emitGameJoinEvent } from "../ws/events/game/game.join.event.ws"


class GameInstanceManagerClass {
    public gameInstances:GameInstance[]  = []
    public gameLobbys : GameLobby[] = []

    constructor(){}

    public getPlayerGame(uuid:UUID) : null | GameInstance {
        const game = this.gameInstances.find((game)=>game.players.w.id === uuid || game.players.b.id === uuid)
        return game !== undefined ? game : null
    }

    public getGame(gameID:UUID) : null | GameInstance {
        const game = this.gameInstances.find((game)=>game.id === gameID)
        return game !== undefined ? game : null
    }

    public newGame(p1:NewGamePlayer,p2:NewGamePlayer,uuid?:string) : GameInstance {
        const newGameInstance = new GameInstance(p1,p2)
        newGameInstance.setEventCallback("conclusion",()=>{
            this.gameInstances.splice(this.gameInstances.indexOf(newGameInstance),1)
            GameTerimation.terminate(newGameInstance)

            emitGameEndEvent(newGameInstance.id,{})
            destroyGameRoom(newGameInstance.id)
        })
        
        createGameRoom({
            room:newGameInstance.id,
            pids:[p1.id, p2.id]
        })

        emitGameJoinEvent(newGameInstance.id, newGameInstance.snapshot())

        this.gameInstances.push(newGameInstance)
        return newGameInstance
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
        socketManagment.join(player.id,`lobby:${newLobby.id}`)
        io.to(`lobby:${newLobby.id}`).emit("lobby:joined",newLobby.id)
        
        this.gameLobbys.push(newLobby)
        return newLobby
    }

    public joinLobby({
        targetLobbyID, 
        player
    } : {
        targetLobbyID : UUID, 
        player : {
            id: UUID, 
            displayName:string
        }
    }) : GameInstance | null {
        const lobby = this.getLobby(targetLobbyID)
        if(lobby === null){
            return null
        }
        this.endLobby(lobby.id) //on join cease lobby existence as game is created.
        return this.newGame({id:lobby.player.id,preference:null,displayName:lobby.player.displayName},{id:player.id,displayName:player.displayName,preference:null})
    }

    public endLobby(lobbyID:UUID) : void {
        const lobby = this.getLobby(lobbyID)
        if(lobby !== null){
            this.gameLobbys.splice(this.gameLobbys.indexOf(lobby),1)
            io.to(`lobby:${lobby.id}`).emit("lobby:ended",lobby.id)
            socketManagment.leave(lobby.player.id,`lobby:${lobby.id}`)
        }
    }

    public playerIsInLobby(playerID:UUID) : boolean {
        
        return this.getPlayerLobby(playerID) === null
    }
}


export const GameInstanceManager = new GameInstanceManagerClass()