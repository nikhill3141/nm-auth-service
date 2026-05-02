import { Router } from "express";
import { provideClientPage, registerClient } from "./client.controller";

const route = Router()

route.post("/register",registerClient)
route.get("/add",provideClientPage)



export default route