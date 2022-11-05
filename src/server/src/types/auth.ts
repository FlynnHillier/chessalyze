export type OAuthProvider = "google"

export interface IUser {
    uuid:string,
    name:string,
    email:string,
    oAuth:{
        provider:OAuthProvider,
        id:string,
    }
}