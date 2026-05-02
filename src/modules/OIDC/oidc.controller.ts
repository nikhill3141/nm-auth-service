import { Request, Response } from "express";
import path from "node:path";
import jose from "node-jose";
import { PRIVATE_KEY, PUBLIC_KEY } from "../../common/utils/cert";
import Client from "../Client/client.model";
import AuthCode from "../Client/authCode.model";
import User from "../User/user.model";
import JWT from "jsonwebtoken";

//gives all the routes when call on "/.wellknow..."
const oidcProtocol = (req: Request, res: Response) => {
  const ISSUER = `http://localhost:${process.env.PORT || 8000}`;
  return res.json({
    issuer: ISSUER,
    authorization_endpoint: `${ISSUER}/nm-auth`,
    token_endpoint: `${ISSUER}/token`,
    userinfo_endpoint: `${ISSUER}/nm-auth/userinfo`,
    jwks_uri: `${ISSUER}/.well-known/jwks.json`,
  });
};

//provides the public keys using jose
const jwksProvider = async (_: any, res: Response) => {
  const key = await jose.JWK.asKey(PUBLIC_KEY, "pem");
  return res.json({ keys: [key.toJSON()] });
};

//serves the static html:frontendPage(auth page)
const provideAuthPage = async (req: Request, res: Response) => {
  return res.sendFile(path.resolve("public", "signup.html"));
};

//token endpoint
//todo :check the client bug 
const tokenController = async (req: Request, res: Response) => {
  try {
    const { grant_type, code, client_id, client_secret, redirect_uri } =
      req.body;

    if (grant_type !== "authorization_code") {
      return res.status(400).json({ error: "unsupported_grant_type" });
    }
    //step 1: verify all types
    if (
      typeof code !== "string" ||
      typeof client_id !== "string" ||
      typeof redirect_uri !== "string"
    ) {
      return res.status(400).json({
        error: "invalid_request",
      });
    }
    //Step 2: validate client_id and client_serect

    const client = await Client.findOne({ clientId: client_id });
    if (!client) {
      return res.status(401).json({
        error: "invalid_client",
      });
    }
    if (client.clientSecret && client.clientSecret !== client_secret) {
      return res.status(401).json({
        error: "invalid_client",
      });
    }
    //Step 3 find the auth code
    const authCode = await AuthCode.findOne({ code });
    if (!authCode) {
      return res.status(400).json({
        error: "invalid_grant:authcode",
      });
    }
    if (authCode.clientId !== client_id) {
      return res.status(400).json({
        error: "invalid_grant:client id match",
      });
    }

    if (authCode.redirectUri !== redirect_uri) {
      return res.status(400).json({
        error: "invalid_grant: redirect uri match",
      });
    }

    // Check expiry
    if (authCode.expiresAt.getTime() < Date.now()) {
      await AuthCode.deleteOne({ code });
      return res.status(400).json({
        error: "invalid_grant: to much time",
      });
    }
    //get the use
    const user = await User.findById({_id:authCode.userId});

    if (!user) {
      return res.status(400).json({
        error: "invalid_grant: user not found",
      });
    }

    //delete the authcode
    await AuthCode.deleteOne({ code });
    const ISSUER = `http://localhost:${process.env.PORT}`;
    const now = Math.floor(Date.now() / 1000);

    //create id token (OIDC-format)
    const idToken = JWT.sign(
      {
        iss: ISSUER,
        sub: user.id,
        aud: client_id,
        exp: now + 3600,
        iat: now,
        email: user.email,
        email_verified: user.emailVerified,
        name: [user.firstName, user.lastName].filter(Boolean).join(" "),
      },
      PRIVATE_KEY,
      { algorithm: "RS256" },
    );
    //create access token
    const accessToken = JWT.sign(
      {
        client_id,
        sub: user.id,
      },
      PRIVATE_KEY,
      { algorithm: "RS256", expiresIn: "1h" },
    );

    return res.json({
      access_token: accessToken,
      id_token: idToken,
      token_type: "Bearer",
      expires_in: 3600,
    });
  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
};

export { provideAuthPage, oidcProtocol, jwksProvider, tokenController };
