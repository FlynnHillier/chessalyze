import {useContext,useState} from "react"
import { AuthContext } from "../contexts/auth.context"

export const useAuth = () => {
    return useContext(AuthContext)
}