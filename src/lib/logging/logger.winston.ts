import winston from "winston";
import { env } from "~/env";

/**
 *
 * @param logID unique log name
 * @returns standardised log filepath
 */
const fp = (logID: string) => `logs/${logID}.log`;

const minimisedFormat = winston.format.printf(
  ({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  },
);

/**
 *
 * @param label the label to be used when logging
 * @returns a winston logging object to be formatted using the label specified
 */
function labelledLoggerFactory(label: string) {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.label({ label }),
      winston.format.json(),
    ),
    transports: [
      new winston.transports.File({
        filename: fp("error"),
        level: "error",
      }),
      new winston.transports.File({ filename: fp("info"), level: "info" }),
      new winston.transports.File({
        filename: fp("debug"),
        level: "debug",
      }),
      new winston.transports.Console({
        level: env.NODE_ENV === "development" ? "debug" : "info",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.label({ label }),
          minimisedFormat,
        ),
      }),
    ],
  });
}

/**
 * Server Disk & Console logging
 */
export class Logger {
  public static general = labelledLoggerFactory("general");
  public static sockets = labelledLoggerFactory("sockets");
  public static game = labelledLoggerFactory("game");
  public static lobby = labelledLoggerFactory("lobby");
}
