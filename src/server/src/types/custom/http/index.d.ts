import {IUser} from "../../auth"

declare module "http" {
    interface IncomingMessage {
        session: Session & {
            authenticated:boolean
            socket:Socket
        }
        user?: IUser
    }
}

export {}