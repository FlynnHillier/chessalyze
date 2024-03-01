import {Request,Response, NextFunction, Router} from "express"
import { validationResult, checkSchema , Schema, check} from "express-validator"
import { InvalidSchemaException} from "../types/errors"

export const validateSchema = (schema:Schema) => {
    return Router().use(
        checkSchema(schema),
        (req:Request,res:Response,next:NextFunction) => {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return next(new InvalidSchemaException(errors))
            }
            next()
        }
    )
}