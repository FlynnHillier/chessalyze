import { ResponseError } from "../types/response"
import axios,{AxiosError} from "axios"

export const applyAxiosDefaultHeaders = () => {
    axios.defaults.baseURL = process.env.NODE_ENV === "development" ? `http://${process.env.REACT_APP_DOMAIN}/` : ""
    axios.defaults.withCredentials = true
}

export const retrieveAxiosErrorMessage = (error:AxiosError) : string => {
    if(error.response?.data){
        if((error.response.data as ResponseError).message){
            return (error.response.data as ResponseError).message
        }
    }
    return error.message
}

export default applyAxiosDefaultHeaders