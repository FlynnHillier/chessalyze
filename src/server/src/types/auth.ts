export type OAuthProvider = "vanilla" | "google" 

export interface IUser {
    uuid:string,
    name:string,
    email:string,
    oAuth:{
        provider:OAuthProvider,
        id:string,
    }
    password:string
}

export type UUID = string