import axios from "axios"
import {useState} from "react"
import { retrieveAxiosErrorMessage } from "../../util/util.axios"
import { useLobby } from "../contexts/useLobby"


export const useLeaveLobby = () => {
    const [isLoading,setIsLoading] = useState<boolean>(false)
    const [error,setError] = useState<any>(null)
    const [errorMessage,setErrorMessage] = useState<string>("")
    const {dispatchLobbyStatus} = useLobby()

    const clearErrorMessage = () => {
        setErrorMessage("")
    }

    const leaveLobby = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get("/a/game/lobby/leave")         
            dispatchLobbyStatus({
                type:"END",
                payload:{
                    lobbyDetails:{...response.data.lobbyDetails}
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

    return {isLoading,error,errorMessage,leaveLobby,clearErrorMessage}
}