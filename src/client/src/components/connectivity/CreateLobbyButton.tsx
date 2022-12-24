import React,{useState} from 'react'
import FancyButton from "../util/FancyButton"
import { useCreateLobby } from '../../hooks/game/useCreateLobby'

const CreateLobbyButton = () => {
    const {isLoading,createLobby} = useCreateLobby()


    function onClick(){
        createLobby()
    }

    return (
        <FancyButton
            text={"create lobby"}
            isLoading={isLoading}
            onClick={onClick}
        />
  )
}

export default CreateLobbyButton