import {UUID} from "chessalyze-common"

export type OAuthProvider = "vanilla" | "google" 

export interface IUser {
    uuid:UUID,
    permission:"admin" | "standard"
    name:string,
    email?:string,
    oAuth:{
        provider:OAuthProvider,
        id?:string,
    }
    password?:string
}