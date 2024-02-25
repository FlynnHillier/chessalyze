import { UUID } from "@common/src/types/misc"
import {useEffect, useState} from "react"
import { useGame } from "../contexts/useGame"
import { trpc } from "../../util/trpc"

export const useJoinLobby = () => {
    const [isLoading,setIsLoading] = useState<boolean>(false)
    const [error,setError] = useState<any>(null)
    const [errorMessage,setErrorMessage] = useState<string>("")
    const {dispatchGameStatus} = useGame()
    
    const mutation = trpc.a.lobby.join.useMutation()


    const clearErrorMessage = () => {
        setErrorMessage("")
    }

    const joinLobby = async (lobbyID:UUID) => {
        setIsLoading(true)
        try {
            await mutation.mutateAsync({
                lobby:{
                    id:lobbyID
                }
            })

            return mutation.isSuccess
            // // ###should occur via socket event anyways, hence commented out.
            // dispatchGameStatus({
            //     type:"JOIN",
            //     payload:{
            //         gameDetails:{...response.data.gameDetails}
            //     }
            // })
        } catch(err){
            setError(err)
            return false
        } finally{
            setIsLoading(false)
        }
    }

    return {isLoading,error,errorMessage,joinLobby,clearErrorMessage}
}


