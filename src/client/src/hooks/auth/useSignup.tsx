import {useState} from "react"
import {useAuth} from "../contexts/useAuth"
import axios from "axios"
import { retrieveAxiosErrorMessage } from "../../util/util.axios"

export const useSignup = () => {
    const [error,setError] = useState<any>(null)
    const [errorMessage,setErrorMessage] = useState<string>("")
    const [isLoading,setIsLoading] = useState<boolean>(false)
    const {dispatchAuth} = useAuth()

    const clearErrorMessage = () => {
        setErrorMessage("")
    }

    const signup = async (username:string,password:string) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await axios.post("/auth/v/signup",({username,password}))
            if(response.data.result){
                dispatchAuth({type:"LOGIN",payload:{
                    userInfo:{
                        email:response.data.userInfo.email,
                        username:response.data.userInfo.username,
                        id:response.data.userInfo.id,
                    }
                }})
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


    return {error,isLoading,signup,errorMessage,clearErrorMessage}
}