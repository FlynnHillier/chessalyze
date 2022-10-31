export type OAuthProvider = "google"

export interface IUser {
    id:string,
    name:string,
    email:string,
    oAuthProvider:OAuthProvider,
}