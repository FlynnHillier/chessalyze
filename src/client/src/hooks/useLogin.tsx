import {useState} from "react"
import {useAuth} from "./useAuth"
import axios from "axios"

export const useLogin = () => {
    const [error,setError] = useState<any>(null)
    const [isLoading,setIsLoading] = useState<boolean>(false)
    const {dispatchAuth} = useAuth()

    const login = async (username:string,password:string) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await axios.post("/auth/v/login",({username,password}))
            if(response.data.result){
                dispatchAuth({type:"LOGIN",payload:{
                    email:response.data.userInfo.email,
                    username:response.data.userInfo.username,
                    id:response.data.userInfo.id,
                }})
            }
        } catch(err){
            setError(err)
        } finally{
            setIsLoading(false)
        }
    }


    return {error,isLoading,login}
}