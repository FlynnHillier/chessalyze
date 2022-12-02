import React from 'react'
import { useFetchGameState } from '../hooks/useFetchGameState'
import { useGame } from '../hooks/useGame'

const TempLoadGame = () => {
    const {fetchGameState,isLoading,errorMessage,clearErrorMessage} = useFetchGameState()
    const {gameStatus} = useGame()

    return (
    <>
        <button
            onClick={()=>{console.log(gameStatus)}}
        >
            log game status
        </button>
        <button
            disabled={isLoading}
            onClick={()=>{
                clearErrorMessage()
                fetchGameState()
            }}
        >load game status</button>
        {`${errorMessage}`}
    </>
  )
}

export default TempLoadGame