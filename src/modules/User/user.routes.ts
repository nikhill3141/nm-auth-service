import { Router } from "express";
import { signInUser, signUpUser, userInfo } from "./user.controller";


const route = Router()

route.post('/sign-in',signInUser)
route.post('/sign-up',signUpUser)
route.get('/userinfo',userInfo)

export default route