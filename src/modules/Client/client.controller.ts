import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import Client from "./client.model";
import path from "path";

// register client
const registerClient = async (req: Request, res: Response) => {
  try {
    const { companyName, redirectUrl } = req.body;

    if (!companyName || !redirectUrl) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // generate clientSecret securely
    const clientSecret = crypto.randomBytes(32).toString("hex");

    const client = await Client.create({
      companyName,
      redirectUrl,
      clientSecret,
    });

    return res.status(201).json({
      client_id: client.clientId,
      client_secret: clientSecret, // show once
      redirect_url: client.redirectUrl,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//provide the clientRegister page
const provideClientPage = (req:Request, res:Response) => {
  return res.sendFile(path.resolve("public","clientRegister.html"))
}



export { 
  registerClient,
  provideClientPage,
 

 };