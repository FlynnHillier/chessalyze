import { UUID } from "@common/src/types/misc";
import { Result,ValidationError } from "express-validator";



export class HttpException extends Error {
  code:string;
  constructor(public status : number, public message: string, code? :string) {
    super(message);
    this.code = code || "defaultError"
  }
}

export class GameIsPresentException extends HttpException {
  public status: number
  public message : string
  constructor(public gameID : UUID | null,{status = 403,message = "user is already in game"} : {status?:number,message?:string} = {}) {
    super(status,message,"isGamePresent")
    this.status = status
    this.message = message
  }
}

export class GameIsNotPresentException extends HttpException {
  public status: number
  public message : string
  constructor({status = 403,message = "user is not in a game"} : {status?:number,message?:string} = {}) {
    super(status,message,"isNotGamePresent")
    this.status = status
    this.message = message
  }
}

export class LobbyIsPresentException extends HttpException {
  public status: number
  public message : string
  constructor(public lobbyID : UUID | null,{status = 403,message = "user is already in lobby"} : {status?:number,message?:string} = {}) {
    super(status,message,"isLobbyPresent")
    this.status = status
    this.message = message
  }
}

export class LobbyIsNotPresentException extends HttpException {
  public status: number
  public message : string
  constructor({status = 403,message = "user is not in lobby"} : {status?:number,message?:string} = {}) {
    super(status,message,"isNotLobbyPresent")
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