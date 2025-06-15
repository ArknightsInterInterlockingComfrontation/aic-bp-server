import express from "express";
import { createServer } from "http";
import router from "../router";
import config from "../app.config";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import passport from "passport";

export const app: express.Express = express();
export const server = createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session(config.session));
app.use(cookieParser(config.cookie.sign));
app.use(passport.initialize());
app.use(passport.session());
app.use("/", router);
app.use(express.static(path.resolve(__dirname, "../public")));

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  res.header("Content-Type", "application/json;charset=utf-8");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
