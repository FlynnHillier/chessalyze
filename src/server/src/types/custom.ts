import {IUser} from "./auth"

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}