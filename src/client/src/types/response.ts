export interface ResponseError {
    message:string,
    code:string,
    meta:{[key:string]:any}
}