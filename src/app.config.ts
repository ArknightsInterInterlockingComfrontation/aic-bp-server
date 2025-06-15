import args from "./modules/args";
import { Options as RateLimit } from "express-rate-limit";
import { CookieParseOptions } from "cookie-parser";
import { StrategyOptions, ExtractJwt } from "passport-jwt";
import { SessionOptions } from "express-session";
const allowlist = ["192.168.1.1"];

interface Config {
  port: number | string;
  session: SessionOptions;
  cookie: Partial<{
    sign: string;
    options: CookieParseOptions;
  }>;
  rateLimit: Partial<RateLimit>;
  modules: Partial<{
    mysql: boolean;
    mailer: boolean;
    socket: boolean;
    webdav: boolean;
  }>;
  jwt: StrategyOptions;
}

const config: Config = {
  session: {
    secret: "default secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // 是否仅通过 HTTPS 连接传输 cookie
      maxAge: 1000 * 60 * 15,
    },
    name: "session.sid",
  },
  cookie: {
    sign: "default sign",
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    //skip: (request, response) => allowlist.includes(request.ip),
  },
  jwt: {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "secret",
  },
  port: args.port || 3000,
  modules: {},
};

export default config;
