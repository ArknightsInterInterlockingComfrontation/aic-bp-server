import "express-session";

declare module "express-session" {
  interface SessionData {
    [key: string]: string | number | boolean | undefined;
  }
}


