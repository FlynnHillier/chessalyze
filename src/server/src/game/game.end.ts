import { GameState } from "./gameState"
import { GameModel } from "../models/games"
import mongoose from "mongoose"
import { getMongoConnectionStatus } from "../init/init.mongoose"
import { GameSummary } from "@common/src/types/game"

class GameTerminator {
    private backlog : GameState[] = []
    private paused: boolean

    constructor(){
        this.paused = !getMongoConnectionStatus()

        mongoose.connection.on("disconnected",()=>{
            this.onMongoDisconnect()
        })
        mongoose.connection.on("connected",()=>{
            this.onMongoConnect()
        })
    }

    public async terminate(game:GameState){
        this.storeResult(game)
    }

    private async storeResult(game:GameState,isRestoration=false) : Promise<boolean>{
        while(!this.paused){
            try {
                const result = await GameModel.create({
                    ...game.getSummary() as GameSummary
                })
                return true
            } catch(err){
                if(!isRestoration){
                    this.backlog.push(game)
                }
                return false
            } 
        }
        return false
    }

    private async restoreBacklog({attempts = 3} : {attempts?:number} = {}) : Promise<GameState[]>{
        const failedRestorations : GameState[] = []
        
        for(const backloggedGame of this.backlog){
            let attempt = 0
            let success = false
            for(let i = 0; i < attempts;attempt++){
                success = await this.storeResult(backloggedGame,true)
                if(success){continue}
            }

            if(success){
                this.backlog.splice(this.backlog.indexOf(backloggedGame),1)
            }
            if(!success){
                failedRestorations.push(backloggedGame)
            }
        }
        return failedRestorations
    }

    private onMongoDisconnect() : void{
        this.paused = true
    }


    private onMongoConnect() : void {
        if(this.paused){
            this.restoreBacklog()
        }
        this.paused = false
    }
}

export const GameTerimation = new GameTerminator()