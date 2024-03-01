import {createContext,ReactNode,useState,useEffect, useReducer} from "react"
import axios from "axios"
import { User } from "../types/auth"

const initialAuthState = {
    hasPersisted:false,
    isLoggedIn:false,
    userInfo:{
        username:"",
        email:"",
        id:"",
    }
}

type AuthState = typeof initialAuthState

type AuthReducerPayload = AuthState["userInfo"]

export interface UserReducerAction {
    type:"LOGIN" | "LOGOUT" | "SIGNUP" | "PERSIST"
    payload:{
        userInfo?:AuthReducerPayload
        onPersistIsLoggedIn?:boolean
    }
}

function userReducer(auth:AuthState,action:UserReducerAction) : AuthState{
    switch (action.type){
        case "PERSIST":
            if(action.payload.onPersistIsLoggedIn){
                return {...auth,userInfo:action.payload.userInfo as AuthReducerPayload , isLoggedIn:true,hasPersisted:true}
            } else{
                return {...auth,userInfo:action.payload.userInfo as AuthReducerPayload , isLoggedIn:action.payload.onPersistIsLoggedIn as boolean,hasPersisted:true}
            }
        case "LOGIN":
            return {...auth,userInfo:action.payload.userInfo as AuthReducerPayload, isLoggedIn:true}
        case "SIGNUP":
            return {...auth,userInfo:action.payload.userInfo as AuthReducerPayload, isLoggedIn:true}
        case "LOGOUT":
            return {...initialAuthState,hasPersisted:auth.hasPersisted}
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

