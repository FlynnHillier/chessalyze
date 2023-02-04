import axios from "axios"
import {useState} from "react"
import { retrieveAxiosErrorMessage } from "../../util/util.axios"
import { useGame } from "../contexts/useGame"


export const usePersistGame = () => {
    const [isLoading,setIsLoading] = useState<boolean>(false)
    const [error,setError] = useState<any>(null)
    const [errorMessage,setErrorMessage] = useState<string>("")
    const {dispatchGameStatus} = useGame()

    const clearErrorMessage = () => {
        setErrorMessage("")
    }


    const persistGame = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get("/a/game/getState")            
            dispatchGameStatus({
                type:"PERSIST",
                payload:{
                    onPersistIsInGame:response.data.isInGame,
                    gameDetails:{...response.data.gameDetails}
                }
            })
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

    return {isLoading,error,errorMessage,persistGame,clearErrorMessage}
}