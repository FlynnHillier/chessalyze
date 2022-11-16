import passport from "passport"
import {Strategy} from "passport-google-oauth20"
import {UserModel} from "./../models/users"
import {v1 as uuidv1} from "uuid"


passport.use(new Strategy({
    clientID:process.env.OAUTH_CLIENT_ID as string,
    clientSecret:process.env.OAUTH_CLIENT_SECRET as string,
    callbackURL:`http://localhost:${process.env.PORT}/auth/o/google/redirect`
},async function(accessToken, refreshToken, profile, done){
    try {
        const existingUserCredentials = await UserModel.findOne({
            oAuth:{
                provider:"google",
                id:profile.id
            }
        })

        if(existingUserCredentials){
            return done(null,existingUserCredentials)
        } else{
            let email = ""
            if(profile.emails && profile.emails.length !== 0){
                email = profile.emails![0].value
            }

            const newUserCredentials = await UserModel.create({
                uuid:uuidv1(),
                name:profile.displayName,
                email:email,
                oAuth:{
                    provider:"google",
                    id:profile.id,
                }
            })

            return done(null,newUserCredentials)
        }
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