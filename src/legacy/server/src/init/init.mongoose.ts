import mongoose from "mongoose"

function initialiseMongooseConnectionEvents(setConnectionStatus:(value:boolean)=>void) : void {
    mongoose.connection.on("disconnected",()=>{
        setConnectionStatus(false)
    })
    mongoose.connection.on("close",()=>{
        setConnectionStatus(false)
    })
    mongoose.connection.on("connected",()=>{
        setConnectionStatus(true)
    })
    mongoose.connection.on("reconnect",()=>{
        setConnectionStatus(true)
    })
}

export async function establishMongoConnection(uri:string,onConnection:()=>void = ()=>{}) : Promise<void> {
    initialiseMongooseConnectionEvents((v:boolean)=>{mongoConnectionStatus=v})
    try {
        await mongoose.connect(uri)
    } catch(err){
        throw {
            message:`an error occured while attempting to establish a connection with mongoDB.`,
            error:err,
        }
    }
}

let mongoConnectionStatus = false
export function getMongoConnectionStatus(){
    return mongoConnectionStatus
}