import React,{useState} from 'react'
import { useAuth } from '../contexts/useAuth'
import axios from 'axios'
import { retrieveAxiosErrorMessage } from '../../util/util.axios'

export const usePersistAuth = () => {
    const [error,setError] = useState<any>(null)
    const [errorMessage,setErrorMessage] = useState<string>("")
    const [isLoading,setIsLoading] = useState<boolean>(false)
    const {dispatchAuth} = useAuth()

    const clearErrorMessage = () => {
        setErrorMessage("")
    }

    const persistAuth = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await axios.get("/auth/status")
            dispatchAuth({type:"PERSIST",payload:{
                onPersistIsLoggedIn:response.data.authenticated,
                userInfo:response.data.authenticated ? response.data.userInfo : {}
            }})
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


    return {error,errorMessage,isLoading,persistAuth,clearErrorMessage}
}

export default usePersistAuth