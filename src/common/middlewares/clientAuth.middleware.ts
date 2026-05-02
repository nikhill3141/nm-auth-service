import { NextFunction, Request, Response } from "express";
import Client from "../../modules/Client/client.model";
import path from "node:path";

export const authenticateClient = async (req:Request, res:Response, next:NextFunction) => {
  const { client_id, redirect_uri, state } = req.query;

  if(!client_id){
    return res.sendFile(path.resolve("public","authError.html"))
  }
  if(!redirect_uri){
     return res.sendFile(path.resolve("public","authError.html"))
  }
  if (typeof client_id !== "string") {
  return res.status(400).json({ message: "Invalid client_id" });
} 
  // validate client_id
  if (typeof client_id !== "string") {
    return res.status(400).json({ message: "Invalid client_id" });
  }

  // validate redirect_uri (optional but recommended)
  let redirectUri: string | undefined;

  if (typeof redirect_uri === "string") {
    redirectUri = redirect_uri;
  }

  //  validate state
  let safeState: string | undefined;
  if (typeof state === "string") {
    safeState = state;
  }

// validate client
  const client = await Client.findOne({clientId:client_id });
  if(client.redirectUrl !== redirect_uri){
    return res.sendFile(path.resolve("public","authError.html"))
  }
  req.session.client = {
    clientId: client.clientId,
    redirectUri: redirect_uri // fallback
  };

  req.session.state  = safeState;

  if(client) {
    next()
  }
}