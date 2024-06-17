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
    return `${timestamp} [${label}] ${level}: ${typeof message === "string" ? message : "See log-file for details"}`;
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

export const generalLog = labelledLoggerFactory("general");
export const socialLog = labelledLoggerFactory("social");
export const socketLog = labelledLoggerFactory("socket");
export const gameLog = labelledLoggerFactory("game");
export const lobbyLog = labelledLoggerFactory("lobby");
