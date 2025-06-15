import winston from "winston";
import path from "path";
import DailyRotateFile from "winston-daily-rotate-file";

export const logger: winston.Logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: path.resolve(__dirname, "../logs/app.log") }),
    new winston.transports.File({
      filename: path.resolve(__dirname, "../logs/app-json.log"),
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      maxsize: 1024 * 1024 * 10,
    }),
    new DailyRotateFile({
      filename: path.resolve(__dirname, "../logs/app-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});
