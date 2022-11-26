import  {Router} from "express"

import {api_user_getName} from "./api.user.getName"

export const api_user_router = Router()

api_user_router.use("/name",api_user_getName)


export default api_user_router