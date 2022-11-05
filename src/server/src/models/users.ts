import { OAuthProvider,IUser } from "./../types/auth"
import mongoose,{Schema} from "mongoose"


export const userSchema = new Schema<IUser>({
    uuid:{type:String,required:true},
    name:{type:String,required:true},
    email:{type:String,required:true},
    oAuth:{
            provider:{
                type:String,
                required:true
            },
            id:{
                type:String,
                required:true
            },
        }
}) 

export const UserModel = mongoose.model("user",userSchema)
