import {Express,User} from "express"
import {IUser} from "./../../auth"

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}
// declare module "express" {
//     export interface User extends IUser {}
// }

export {}