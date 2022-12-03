import {useState} from "react"
import {useAuth} from "../useAuth"
import axios from "axios"
import { retrieveAxiosErrorMessage } from "../../util/util.axios"

export const useLogout = () => {
    const [error,setError] = useState<any>(null)
    const [errorMessage,setErrorMessage] = useState<string>("")
    const [isLoading,setIsLoading] = useState<boolean>(false)
    const {dispatchAuth} = useAuth()

    const clearErrorMessage = () => {
        setErrorMessage("")
    }

    const logout = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await axios.get("/auth/logout")
            if(response.status >= 200 && response.status < 300){
                dispatchAuth({type:"LOGOUT",payload:{}})
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


    return {error,errorMessage,isLoading,logout,clearErrorMessage}
}