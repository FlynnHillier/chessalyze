import {UUID} from "../types/auth"
import {Chess, ChessInstance, PieceType, Square} from "chess.js"
import {v1 as uuidv1} from "uuid"
import {GameSummary,GameConclusion,GameTermination} from "../types/game"


interface NewGamePlayer {
    uuid:UUID,
    preference: null | "w" | "b"
}

interface EventCallBacks {
    conclusion:(...args:any[])=>void
}


export class GameState {
    public players : {
        w:UUID,
        b:UUID
    }
    public id : UUID
    private startTime : number
    private summary : GameSummary | null = null
    private game : ChessInstance = new Chess()
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
        if(this.game.game_over() || this.game.in_draw()){
            this.onGameEnd()
        }
        return true
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
        }

        for(let move of this.game.history({verbose:true})){
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
            moves:this.game.history(),
            time:{
                start:this.startTime,
                end:dateMS,
                duration:this.startTime-dateMS,
            }
        }
        
        return summary
    }

    public isValidMove(sourceSquare:Square,targetSquare:Square,promotion?:"n" | "b" | "r" | "q"){
        return this.game.moves({verbose:true}).some(((move)=>{move.from === sourceSquare && move.to === targetSquare && move.promotion === promotion}))
    }

    private _generateGameConclusion() : GameConclusion {
        let termination : GameTermination
            if(this.game.in_checkmate()){
                termination = "checkmate"
            } else if(this.game.in_stalemate()){
                termination = "stalemate"
            } else if(this.game.in_threefold_repetition()){
                termination = "3-fold repition"
            } else if(this.game.insufficient_material()) {
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

    private _generateColorConfiguration(p1:NewGamePlayer,p2:NewGamePlayer) : {w:UUID,b:UUID} {
        if(p1.preference === null && p2.preference === null || p2.preference === p1.preference){ //generate random configuration
            return Math.random() < 0.5 ? {"b":p1.uuid,"w":p2.uuid} : {"b":p2.uuid,"w":p1.uuid}
        }

        return { //configuration that honours preferences
            w:p1.preference === "w" ? p1.uuid : p2.preference === null ? p2.uuid : p1.uuid,
            b:p1.preference === "b" ? p1.uuid : p2.preference === null ? p2.uuid : p1.uuid
        }
    }
}