import {useState} from "react"
import { useLobby } from "../contexts/useLobby"
import { trpc } from "../../util/trpc"


export const useCreateLobby = () => {
    const [isLoading,setIsLoading] = useState<boolean>(false)
    const [error,setError] = useState<any>(null)
    const [errorMessage,setErrorMessage] = useState<string>("")
    const {dispatchLobbyStatus} = useLobby()

    const mutation = trpc.a.lobby.create.useMutation()

    const clearErrorMessage = () => {
        setErrorMessage("")
    }

    const createLobby = async () => {
        setIsLoading(true)
        try {
            const r = await mutation.mutateAsync()

            dispatchLobbyStatus({
                type:"START",
                payload:{
                    lobbyDetails:{
                        id:r.lobby.id
                    }
                }
            })

            return true
        } catch(err){
            setError(err)
            return false
        } finally{
            setIsLoading(false)
        }
    }

    return {isLoading,error,errorMessage,createLobby,clearErrorMessage}
}