import React from 'react'
import "../../styles/game/timer.css"
import ScaleText from "react-scale-text"

interface Props {
    time:number //in ms
}

const Clock = ({time} : Props) => {
    function padDigit(num:number | string,padTo:number = 2) : string { //return a string of length padTo, or greater if num length is longer
        if(typeof num == "number"){
            num = num.toString()
        }

        if(num.length >= padTo) {
            return num
        }

        return ("0".repeat(padTo) + num).slice(-padTo)
    }

    function msToAnalagoue(time:number) : {
        hr:number, //>=0
        min:number, //<= 60
        sec:number, //<= 60
        ms:number, //<=1000
    } {
        const hr = Math.floor(time / 3600000)
        time -= 3600000 * hr
        const min = Math.floor(time / 60000)
        time -= 60000 * min
        const sec = Math.floor(time/1000)
        time -= 1000 * sec
        const ms = time

        return {
            hr,
            min,
            sec,
            ms,
        }
    }

    function digitalDisplay(time:number) {
        const {hr,ms,min,sec} = msToAnalagoue(time)

        if(min === 0 && hr === 0 && sec < 10){
            return `${padDigit(hr,2)}:${padDigit(min,2)}:${padDigit(sec,2)}:${Math.floor(ms/ 100)}`
        } else{
            return `${padDigit(hr,2)}:${padDigit(min,2)}:${padDigit(sec,2)}`
        }
    }

    return (
        <div className="timer">
            <ScaleText>
                {time === -1 ? "00:00:00" : digitalDisplay(time)}
            </ScaleText>
        </div>
    )
}

export default Clock