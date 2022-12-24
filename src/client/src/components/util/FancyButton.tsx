import React,{useState} from 'react'
import SmoothLoadingSpan from '../loading/SmoothLoadingSpan'
import "./../../styles/misc/buttons.css"

interface Props {
    isLoading:boolean,
    text:string,
    onClick:(...args : any[])=>any,
}

const FancyButton = ({onClick,isLoading,text}:Props) => {

    return (
        <button
            className='fancyButton'
            disabled={isLoading}
            onClick={onClick}
        >
            {!isLoading ? text : <SmoothLoadingSpan/>}
        </button>
    )
}

export default FancyButton