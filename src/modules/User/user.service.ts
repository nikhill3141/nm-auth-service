import { Request, Response } from "express";
import crypto from "node:crypto";
import { URL } from "node:url";
import AuthCode from "../Client/authCode.model";
import  { Types } from "mongoose";

const redirectWithCode = async (
  req: Request,
  res: Response,
  userId:Types.ObjectId,
) => {
  //step 1 : veryify client and get
  if (!req.session.client) {
    return res.status(400).json({
      message: "OAuth session missing",
    });
  }
  const { clientId, redirectUri } = req.session.client;
  const state = req.session.state;

  // STEP 2: Generate authorization code
  const code = crypto.randomBytes(32).toString("hex");

  // STEP 3: Store code in DB
  await AuthCode.create({
    code,
    userId,
    clientId,
    redirectUri,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  // STEP 4: Build redirect URL safely
  const redirectUrl = new URL(redirectUri);

  redirectUrl.searchParams.set("code", code);

  if (state) {
    redirectUrl.searchParams.set("state", state);
  }

  // ✅ STEP 5: Redirect back to client
  return res.redirect(redirectUrl.toString());
};

export { redirectWithCode };
