import { env } from "~/env";

export enum loggingColourCode {
  FgBlack = "\x1b[30m",
  FgRed = "\x1b[31m",
  FgGreen = "\x1b[32m",
  FgYellow = "\x1b[33m",
  FgBlue = "\x1b[34m",
  FgMagenta = "\x1b[35m",
  FgCyan = "\x1b[36m",
  FgWhite = "\x1b[37m",
  FgGray = "\x1b[90m",
}

/**
 * Logs specified message only if NODE_ENV enviroment variable is set to 'development'
 * @param message message to log
 */
export function logDev({
  message,
  color,
}: {
  message: any | any[];
  color?: `${loggingColourCode}`;
}) {
  if (!color) {
    color = loggingColourCode.FgWhite;
  }

  if (!Array.isArray(message)) message = [message];

  if (env.NODE_ENV === "development") console.log(color, ...message);
}
