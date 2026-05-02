import express from "express";


export function createApp() {
  try {
    const app = express();

    return app;
  } catch (error) {
    throw new Error("server error", error);
  }
}
