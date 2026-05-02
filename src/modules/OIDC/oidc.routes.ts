import { Router} from "express";
import {jwksProvider, oidcProtocol, provideAuthPage, tokenController } from "./oidc.controller";
import { authenticateClient } from "../../common/middlewares/clientAuth.middleware";

const route = Router()

//this url serves the auth html page
route.get("/nm-auth",authenticateClient,provideAuthPage)
route.get("/.well-known/openid-configuration",oidcProtocol)
route.get("/.well-known/jwks.json",jwksProvider)
route.post("/token",tokenController)


export default route