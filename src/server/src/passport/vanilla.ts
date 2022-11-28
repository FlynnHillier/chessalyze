import {Strategy} from "passport-local"

import passport from "passport"
import {UserModel} from "./../models/users"
import {v1 as uuidv1} from "uuid"
import bcrypt from "bcrypt"
import { IUser } from "../types/auth"

async function locateExisingUser(name:string) : Promise<null | IUser>{
    return await UserModel.findOne({
        name:name,
        oAuth:{
            provider:"vanilla"
        }
    })
}


async function createUser(name : string,password : string) : Promise<IUser>{
    const user = await UserModel.create({
        uuid:uuidv1(),
        name:name,
        email:"",
        oAuth:{
            provider:"vanilla"
        },
        password:password
    })
    return user
}



passport.use("local-login",new Strategy({usernameField:"username"},async function(username,password, done){
    try {
        const existingUserCredentials = await locateExisingUser(username)

        if(!existingUserCredentials){
            return done(null,null,{message:"user does not exist."})
        }

        if(!bcrypt.compareSync(password,existingUserCredentials.password as string)){
            return done(null,null,{message:"incorrect password"})
        }

        return done(null,existingUserCredentials)        
    } catch(err){
        return done(err as Error,undefined)
    }
}))


passport.use("local-signup",new Strategy({usernameField:"username"},async function(username,password, done){
    try {
        const existingUserCredentials = await locateExisingUser(username)

        if(existingUserCredentials !== null){
            return done(null,null,{message:"user already exists."})
        }

        const userCredentials = await createUser(username,bcrypt.hashSync(password,13))

        return done(null,userCredentials)
                
    } catch(err){
        return done(err as Error,undefined)
    }
}))

passport.serializeUser((user,done)=>{
    done(null,user)
})

passport.deserializeUser((user,done)=>{
    done(null,user as Express.User)
})