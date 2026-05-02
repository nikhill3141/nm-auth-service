import "express-session";

declare module "express-session" {
  interface SessionData {
    client?: {
      clientId: string;
      redirectUri: string;
    };
    state?: string;
  }
}