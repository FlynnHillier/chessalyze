import session from "express-session"
import MongoStore from "connect-mongo"
import { NextFunction,Request,Response } from "express"
import { Socket } from "socket.io"
import { ExtendedError } from "socket.io/dist/namespace"
import e from "express"

export const sessionMiddleware = session({
    secret:"secret!",
    saveUninitialized:true,
    resave: true,
    cookie:{
        sameSite: false,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    },
    store:MongoStore.create({
        mongoUrl:process.env.MONGO_ACCESS_URI,
        ttl: 60 * 60 * 24 * 14,
        autoRemove:"interval",
        autoRemoveInterval:10,
    }),
})

export const socketWrapper = (expressMiddleware:e.RequestHandler) => (socket:Socket,next:(err? : ExtendedError | undefined)=>void) => {
    expressMiddleware(socket.request as Request,{} as Response,next as NextFunction)
}