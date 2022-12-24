import {UUID} from "chessalyze-common"
import {Chess, Square,Move, Color} from "chess.js"
import {v1 as uuidv1} from "uuid"
import {GameSummary,GameConclusion,GameTermination} from "../types/game"


export interface NewGamePlayer {
    uuid:UUID,
    displayName:string,
    preference: null | "w" | "b"
}

interface EventCallBacks {
    conclusion:(...args:any[])=>void
}


export class GameState {
    public players : {
        w:{
            id:UUID,
            displayName:string,
        },
        b:{
            id:UUID,
            displayName:string,
        }
    }
    public id : UUID
    private startTime : number
    private summary : GameSummary | null = null
    private game : Chess = new Chess()
    private events:EventCallBacks = {conclusion:()=>{}}

    constructor(p1:NewGamePlayer,p2:NewGamePlayer,){
        this.players = this._generateColorConfiguration(p1,p2)
        this.id = uuidv1()
        this.startTime = new Date().getMilliseconds()
    }

    public move(sourceSquare:Square,targetSquare:Square,promotion?:"n" | "b" | "r" | "q") : boolean {
        const moveResult = this.game.move({from:sourceSquare,to:targetSquare,promotion:promotion}) === null ? false : true
        if(moveResult === false){
            return false
        }
        if(this.game.isGameOver() || this.game.isDraw()){
            this.onGameEnd()
        }
        return true
    }

    public getFEN() : string {
        return this.game.fen()
    }

    public getTurn() : Color {
        return this.game.turn()
    }

    public isConcluded() : boolean {
        return this.summary !== null
    }

    public getSummary() : GameSummary | null {
        return this.summary
    }

    public getCaptured(color: "w" | "b") {
        let captures = {
            "n":0,
            "b":0,
            "q":0,
            "r":0,
            "p":0,
            "k":0,
        }

        for(let move of this.game.history({verbose:true}) as Move[]){
            if(move.captured && move.color === color){
                captures[move.captured] ++
            }
        }
        
        return captures
    }

    public setEventCallback(event:keyof EventCallBacks,cb:(...args:any[])=>void){
        this.events[event] = cb
    }

    private onGameEnd() {
        this.summary = this.generateSummary()
        this.events.conclusion()
    }

    private generateSummary(){
        const dateMS = new Date().getMilliseconds()
        
        const summary : GameSummary = {
            players:this.players,
            conclusion: this._generateGameConclusion(),
            moves:this.game.history() as string[],
            time:{
                start:this.startTime,
                end:dateMS,
                duration:this.startTime-dateMS,
            }
        }
        
        return summary
    }

    public getPlayerColor(playerUUID:UUID) : Color { //unsafe, change in future.
        if(this.players.w.id === playerUUID){
            return "w"
        } else{
            return "b"
        }
    }


    public isPlayerTurn(playerUUID:UUID) : boolean {
        return this.game.turn() === this.getPlayerColor(playerUUID)
    }

    public isValidMove(sourceSquare:Square,targetSquare:Square,promotion?:"n" | "b" | "r" | "q"){
        const verboseMoves : Move[] = this.game.moves({verbose:true}) as Move[]
        return verboseMoves.some((move)=>{return move.from === sourceSquare && move.to === targetSquare && move.promotion === promotion})
    }

    private _generateGameConclusion() : GameConclusion {
        let termination : GameTermination
            if(this.game.isCheckmate()){
                termination = "checkmate"
            } else if(this.game.isStalemate()){
                termination = "stalemate"
            } else if(this.game.isThreefoldRepetition()){
                termination = "3-fold repition"
            } else if(this.game.isInsufficientMaterial()) {
                termination = "insufficient material"
            } else {
                termination = "50 move rule"
            }
        return {
            boardState:this.game.fen(),
            termination:termination,
            victor:this.game.turn()
        }
    }

    private _generateColorConfiguration(p1:NewGamePlayer,p2:NewGamePlayer) : {w:{id:UUID,displayName:string},b:{id:UUID,displayName:string}} {
        if(p1.preference === null && p2.preference === null || p2.preference === p1.preference){ //generate random configuration
            return Math.random() < 0.5 ? 
            {
                b:{id:p1.uuid,displayName:p1.displayName},
                w:{id:p2.uuid,displayName:p2.displayName}
            }
            : 
            {
                w:{id:p1.uuid,displayName:p1.displayName},
                b:{id:p2.uuid,displayName:p2.displayName}
            }
        }

        return { //configuration that honours preferences
            w:p1.preference === "w" ? {id:p1.uuid,displayName:p1.displayName} : p2.preference === null ? {id:p2.uuid,displayName:p2.displayName} : {id:p1.uuid,displayName:p1.displayName},
            b:p1.preference === "b" ? {id:p1.uuid,displayName:p1.displayName} : p2.preference === null ? {id:p2.uuid,displayName:p2.displayName} : {id:p1.uuid,displayName:p1.displayName}
        }
    }
}