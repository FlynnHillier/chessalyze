import { OAuthProvider } from "../types/auth"
import mongoose,{Schema} from "mongoose"

interface IUser {
    id:string,
    name:string,
    email:string,
    oAuthProvider:OAuthProvider,
}

export const userSchema = new Schema<IUser>({
    id:{type:String,required:true},
    name:{type:String,required:true},
    email:{type:String,required:true},
    oAuthProvider:{type:String,required:true}
}) 

export const UserModel = mongoose.model("user",userSchema)
