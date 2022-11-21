import { UUID } from "./auth";
import { Result,ValidationError } from "express-validator";



export class HttpException extends Error {
  status: number;
  message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export class GamePresenceException extends HttpException {
  public gameID: UUID | null = null
  public lobbyID : UUID | null = null
  public status: number = -1
  public message : string = ""
  constructor({status = 403,message = "user is already in game / lobby",gameID = null,lobbyID = null} : {status?:number,message?:string,gameID?:UUID | null,lobbyID?:UUID | null} = {}) {
    super(status,message)
    this.gameID = gameID
    this.lobbyID = lobbyID
    this.status = status
    this.message = message
  }
}
 

export class InvalidSchemaException extends HttpException {
  constructor(public errors : Result<ValidationError> ,{status = 400,message = "invalid request schema"} : {status?:number,message?:string} = {}){
    super(status,message)
  }
}