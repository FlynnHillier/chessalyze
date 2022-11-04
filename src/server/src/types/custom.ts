import {IUser} from "./auth"
import {Session} from "express-session"

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}

declare module "http" {
    interface IncomingMessage {
        session: Session & {
            authenticated:boolean
        }
    }
}