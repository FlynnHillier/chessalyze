import { Color } from "chess.js"

class Ticker{
    private timer : NodeJS.Timer | null
    private interval //interval to tick at (the decrements the time will go down in)
    private active //if is active
    private duration //initial duration of the clock
    private elapsed //time elapsed on clock
    private ended //if the clock has ran its duration or not

    /**
     * @param duration - the length of time the ticker will run for before ending (ms)
     * @param onTimeOut - will fire when the ticker times out
     * @param interval - the interval in which the ticker will tick (ms)
     */
    constructor(duration:number,private onTimeOut:(...args:any[]) => any,interval:number = 100){
        this.interval = interval
        this.active = false
        this.timer = null
        this.duration = duration
        this.elapsed = 0
        this.ended = false
    }

    private _tick(){
        this.duration -=  this.interval
        this.elapsed += this.interval
        if(this.duration <= 0){ //timer has run out.
            this.pause()
            this.ended = true
            this.onTimeOut()
        }
    }
    
    public start(){
        if(!this.active){
            this.timer = setInterval(this._tick.bind(this),this.interval)
            this.active = true
        }
    }

    public pause(){
        if(this.active && this.timer !== null){
            clearInterval(this.timer)
            this.timer = null
            this.active = false
        }
    }

    public isEnded(){
        return this.ended
    }

    public getElapsed(){
        return this.elapsed
    }

    public isActive(){
        return this.active
    }
}




export class ChessClock { 
    private active = false
    private turn : Color = "w"
    private clocks
    private ended = false
    private timeOutPerspective : null | Color = null
    
    /** 
     * @param time - the initial time each clock will have
     * @param onTimeOutCallBack - will fire when either clock runs out
     */
    constructor(time:number,private onTimeOutCallBack:(perspective:Color)=>any) {
        this.clocks = {
            w:new Ticker(time,()=>{this.onTickerEnd("w")}),
            b:new Ticker(time,()=>{this.onTickerEnd("b")}),
        }
    }

    private onTickerEnd(perspective:Color){
        this.stop()
        this.ended = true
        this.timeOutPerspective = perspective
        this.onTimeOutCallBack(perspective)
    }

    /**
     * @description - start the clock.
     */
    public start(){
        if(!this.active){
            this.clocks[this.turn].start()
        }
    }

    /**
     * @description - stop the clock.
     */
    public stop(){
        if(this.active){
            this.clocks[this.turn].pause()
        }
    }

    /**
     * @description - switches the clock to begin timing out the other perspective's clock.
     */

    public switch(){
        this.clocks[this.turn].pause()
        this.turn = this.turn == "w" ? "b" : "w"
        this.clocks[this.turn].start()
    }

    /**
     * @returns - {false} | {Color} , false if the clock has not yet timed-out; if the clock has timed-out: the colour of who's individual ticker timed out.  
     */
    public hasEnded() : false | Color{
        return this.ended === false ? false : this.timeOutPerspective as Color
    }
}