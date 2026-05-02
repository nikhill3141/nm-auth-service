import { Request, Response } from "express";
import User from "./user.model";
import crypto from "node:crypto";
import JWT from "jsonwebtoken";
import { PUBLIC_KEY, PRIVATE_KEY } from "../../common/utils/cert";
import { JWTClaims } from "../../common/utils/user-token";
import { redirectWithCode } from "./user.service";

//sends the limited time token with the lots of information to client
const signInUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  //implement the client verification and also give the redirect url
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  const user = await User.findOne({ email });
  if (!user || !user.password || !user.salt) {
    res.status(401).json({ message: "Invalid email or password." });
    return;
  }
  //creating hash for comparing the pass
  const hash = crypto
    .createHash("sha256")
    .update(password + user.salt)
    .digest("hex");

  if (hash !== user.password) {
    res.status(401).json({ message: "Invalid email or password." });
    return;
  }
  redirectWithCode(req, res, user._id);
};

//saves the data into the db from the user
const signUpUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!email || !password || !firstName) {
      res
        .status(400)
        .json({ message: "First name, email, and password are required." });
      return;
    }

    const existing = await User.findOne({ email });

    if (existing) {
      res
        .status(409)
        .json({ message: "An account with this email already exists." });
      return;
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");

    const user = await User.create({
      firstName,
      lastName: lastName ?? null,
      email,
      password: hash,
      salt,
    });

    redirectWithCode(req, res, user._id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//checks token if there then dcode token verify it and gives the data
const userInfo = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Validate Authorization header
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({
        error: "invalid_request",
        error_description: "Missing or invalid Authorization header",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify JWT
    let claims: JWTClaims;
    try {
      claims = JWT.verify(token, PUBLIC_KEY, {
        algorithms: ["RS256"],
      }) as JWTClaims;
    } catch (err) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Token is invalid or expired",
      });
    }

    // 3. Validate required claim
    if (!claims.sub) {
      return res.status(400).json({
        error: "invalid_token",
        error_description: "Token missing subject (sub)",
      });
    }

    // 4. Fetch user (sub MUST be string of ObjectId)
  
    const user = await User.findById(claims.sub);

    if (!user) {
      return res.status(404).json({
        error: "invalid_token",
        error_description: "User not found",
      });
    }

    // 5. Return OIDC-compliant user info
    return res.json({
      sub: user._id.toString(),
      email: user.email,
      email_verified: user.emailVerified ?? false,
      given_name: user.firstName ?? "",
      family_name: user.lastName ?? "",
      name: [user.firstName, user.lastName].filter(Boolean).join(" "),
      picture: user.profileImageURL ?? null,
    });
  } catch (err: any) {
    console.error("UserInfo Error:", err);

    return res.status(500).json({
      error: "server_error",
      error_description: "Internal server error",
    });
  }
};

export { signInUser, signUpUser, userInfo };
