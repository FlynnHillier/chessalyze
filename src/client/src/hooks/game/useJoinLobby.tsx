import axios from "axios"
import { UUID } from "chessalyze-common"
import {useState} from "react"
import { retrieveAxiosErrorMessage } from "../../util/util.axios"
import { useGame } from "../contexts/useGame"

export const useJoinLobby = () => {
    const [isLoading,setIsLoading] = useState<boolean>(false)
    const [error,setError] = useState<any>(null)
    const [errorMessage,setErrorMessage] = useState<string>("")
    const {dispatchGameStatus} = useGame()

    const clearErrorMessage = () => {
        setErrorMessage("")
    }

    const joinLobby = async (lobbyID:UUID) => {
        setIsLoading(true)
        try {
            const response = await axios.post("/a/game/lobby/join",{
                lobbyID:lobbyID
            })

            if(response.data.success !== true){
                return false
            }
            
            // // ###should occur via socket event anyways, hence commented out.
            // dispatchGameStatus({
            //     type:"JOIN",
            //     payload:{
            //         gameDetails:{...response.data.gameDetails}
            //     }
            // })

            return true
        } catch(err){
            setError(err)
            if(axios.isAxiosError(err)){
                setErrorMessage(retrieveAxiosErrorMessage(err))
            } else{
                setErrorMessage("something went wrong.")
            }
            return false
        } finally{
            setIsLoading(false)
        }
    }

    return {isLoading,error,errorMessage,joinLobby,clearErrorMessage}
}


