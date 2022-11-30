import {createContext,ReactNode,useState,useEffect, useReducer} from "react"
import axios from "axios"
import { User } from "../types/auth"

const initialAuthState = {
    isLoggedIn:false,
    userInfo:{
        username:"",
        email:"",
        id:"",
    }
}

type AuthState = typeof initialAuthState

export interface UserReducerAction {
    type:"LOGIN" | "LOGOUT" | "SIGNUP"
    payload:User
}

function userReducer(auth:AuthState,action:UserReducerAction) : AuthState{
    switch (action.type){
        case "LOGIN":
            return {...auth,userInfo:action.payload, isLoggedIn:true}
        case "SIGNUP":
            return {...auth,userInfo:action.payload, isLoggedIn:true}
        default:
            return {...auth}
    }
}


const useProvideAuth = () => {
    const [auth,dispatchAuth] = useReducer(userReducer,initialAuthState)

    return {
        auth,
        dispatchAuth
    }
}

export const AuthContext = createContext<ReturnType<typeof useProvideAuth>>({} as ReturnType<typeof useProvideAuth>)

export const AuthProvider = ({children} : {children:ReactNode}) => {
    const auth = useProvideAuth()

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider

