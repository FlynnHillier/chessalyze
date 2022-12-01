import axios from "axios"
import {useState} from "react"
import { retrieveAxiosErrorMessage } from "../util/util.axios"
import { useGame } from "./useGame"


export const useFetchGameState = () => {
    const [isLoading,setIsLoading] = useState<boolean>(false)
    const [error,setError] = useState<any>(null)
    const [errorMessage,setErrorMessage] = useState<string>("")
    const {dispatchGameStatus} = useGame()

    const clearErrorMessage = () => {
        setErrorMessage("")
    }


    const fetchGameState = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get("/a/game/getState")
            console.log(response.data)
            
            if(response.data.isInGame){
                dispatchGameStatus({
                    type:"LOAD",
                    payload:{
                        gameDetails:{...response.data.gameDetails}
                    }
                })
            }
        } catch(err){
            setError(err)
            if(axios.isAxiosError(err)){
                setErrorMessage(retrieveAxiosErrorMessage(err))
            } else{
                setErrorMessage("something went wrong.")
            }
        } finally{
            setIsLoading(false)
        }
    }

    return {isLoading,error,errorMessage,fetchGameState,clearErrorMessage}
}