import winston from "winston";
import { env } from "~/env";

/**
 *
 * @param logID unique log name
 * @returns standardised log filepath
 */
const fp = (logID: string) => `logs/${logID}.log`;

const minimisedFormat = winston.format.combine(
  winston.format.splat(),
  winston.format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  }),
  winston.format.colorize({ all: true }),
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
      winston.format.metadata({
        fillExcept: ["timestamp", "label", "level", "message"],
      }),
    ),
    transports: [
      new winston.transports.File({
        filename: fp("error"),
        level: "error",
        format: winston.format.combine(winston.format.json()),
      }),
      new winston.transports.File({
        filename: fp("info"),
        level: "info",
        format: winston.format.combine(winston.format.json()),
      }),
      new winston.transports.File({
        filename: fp("debug"),
        level: "debug",
        format: winston.format.combine(winston.format.json()),
      }),
      new winston.transports.Console({
        level: env.NODE_ENV === "development" ? "debug" : "info",
        format: winston.format.combine(minimisedFormat),
      }),
    ],
  });
}

const LOGS = {
  general: labelledLoggerFactory("general"),
  social: labelledLoggerFactory("social"),
  socket: labelledLoggerFactory("socket"),
  game: labelledLoggerFactory("game"),
  lobby: labelledLoggerFactory("lobby"),
  profile: labelledLoggerFactory("profile"),
  db: labelledLoggerFactory("db"),
} as const satisfies Record<string, winston.Logger>;

export const log = (log: keyof typeof LOGS) => LOGS[log];
