import { UUID } from "./auth";
import { Result,ValidationError } from "express-validator";



export class HttpException extends Error {
  code:string;
  constructor(public status : number, public message: string, code? :string) {
    super(message);
    this.code = code || "defaultError"
  }
}

export class GamePresenceException extends HttpException {
  public status: number
  public message : string
  constructor(public gameID : UUID | null,{status = 403,message = "user is already in game"} : {status?:number,message?:string} = {}) {
    super(status,message,"gamePresence")
    this.status = status
    this.message = message
  }
}

export class lobbyPresenceException extends HttpException {
  public status: number
  public message : string
  constructor(public lobbyID : UUID | null,{status = 403,message = "user is already in lobby"} : {status?:number,message?:string} = {}) {
    super(status,message,"lobbyPresence")
    this.status = status
    this.message = message
  }
}
 

export class InvalidSchemaException extends HttpException {
  public invalidities : ValidationError[] 
  constructor(errors : Result<ValidationError> ,{status = 400,message = "invalid request schema"} : {status?:number,message?:string} = {}){
    super(status,message,"invalidSchmea")
    this.invalidities = errors.array()
  }
}

export class PermissionException extends HttpException {
  constructor({status = 403,message = "permission denied."} : {status?:number,message?:string} = {}){
    super(status,message,"insufficientPermissions")
  }
}