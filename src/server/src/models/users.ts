import { OAuthProvider,IUser } from "./../types/auth"
import mongoose,{Schema} from "mongoose"


export const userSchema = new Schema<IUser>({
    uuid:{type:String,required:true},
    permission:{type:String,required:true,default:"standard"},
    name:{type:String,required:true},
    email:{type:String},
    oAuth:{
            provider:{
                type:String,
                required:true
            },
            id:{
                type:String,
            },
        },
    password:{
        required:false,
        type:String
    }
}) 

export const UserModel = mongoose.model("user",userSchema)
