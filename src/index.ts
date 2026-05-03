import dotenv from "dotenv";
import path from "node:path";
import express from "express";
import { connectDB } from "./common/db";
import oidcRoutes from "./modules/OIDC/oidc.routes";
import userAuth from "./modules/User/user.routes";
import clientRoutes from "./modules/Client/client.route";
import { createApp } from "./app";
import { errorHandler } from "./common/utils/errorHandler";
import session from "express-session";
dotenv.config();

async function start() {
  const PORT = process.env.PORT ?? 8000;
  const dbUrl = process.env.DB_URL;

  const app = createApp();
  await connectDB(dbUrl);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (req, res) => {
    return res.json({ message: "Server is healthy", healthy: true });
  });
  app.get("/", (req, res) => {
    return res.sendFile(path.resolve("public", "landing.html"));
  });

  app.use(
    session({
      secret: "super-secret",
      resave: false,
      saveUninitialized: true,
    }),
  );
  //later error middelwares
  app.use(errorHandler);

  app.use(express.static(path.resolve("public")));

  app.use("/", oidcRoutes);
  app.use("/nm-auth", userAuth);
  app.use("/clients", clientRoutes);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true, // REQUIRED for HTTPS (Render)
        sameSite: "none", // REQUIRED for cross-site
        maxAge: 1000 * 60 * 10,
      },
    }),
  );
  app.set("trust proxy", 1);

  app.listen(PORT, () => {
    console.log(`AuthServer is running on PORT ${PORT}`);
  });
}
start();
