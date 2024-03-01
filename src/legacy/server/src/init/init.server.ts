import express from "express"

function createServer(port:number,callback:() => void = ()=>{}) {
    try {
        const serverInstance = app.listen(port,callback)
        return serverInstance
    } catch(err){
        throw {
            message:`an error occured while attempting to begin listening on port '${port}'.`,
            error:err,
        }
    }
}

export const app = express()
export const serverInstance = createServer(Number(process.env.PORT),()=>{console.log(`server listening on port ${process.env.PORT}`)})