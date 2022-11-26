export const corsConfig = {
        origin:process.env.NODE_ENV === "development" && process.env.REACT_APP_URL ? process.env.REACT_APP_URL : process.env.HOST_URL,
        credentials:true,
    }

const envVariables = ["PORT","OAUTH_CLIENT_ID","OAUTH_CLIENT_SECRET","MONGO_ACCESS_URI","NODE_ENV"]

export function checkEnvVariables() : void{
    const requiredEnvKeys = envVariables
    
    const undefinedKeys = []
    for(let key of requiredEnvKeys){
        if(process.env[key] === undefined){
            undefinedKeys.push(key)
        }
    }

    if(undefinedKeys.length !== 0){
        throw `some required enviroment variables are not defined: [ ${undefinedKeys.join(", ")} ]`
    }
}