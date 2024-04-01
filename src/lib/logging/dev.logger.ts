import { env } from "~/env";

/**
 * Apply colour to logged messages
 */
type ColourCode = `${loggingColourCode}`;
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
 * Instantiate a new 'category' to be used to identify related logged messages
 */
class LoggingCategory {
  name: string;
  color: string;

  constructor(name: string, color: ColourCode = loggingColourCode.FgWhite) {
    this.name = name;
    this.color = color;
  }
}

/**
 * export instantiated categories for use
 */
export const loggingCategories = {
  misc: new LoggingCategory("misc", loggingColourCode.FgBlack),
  socket: new LoggingCategory("socket", loggingColourCode.FgMagenta),
  lobby: new LoggingCategory("lobby", loggingColourCode.FgBlue),
  game: new LoggingCategory("game", loggingColourCode.FgCyan),
} as const;

/**
 * Logs specified message only if NODE_ENV enviroment variable is set to 'development'
 * @param message message to log
 */
export function logDev({
  message,
  color,
  category,
}: {
  message: any | any[];
  color?: `${loggingColourCode}`;
  category?: LoggingCategory;
}) {
  if (!color) {
    color = loggingColourCode.FgWhite;
  }

  if (!category) {
    category = loggingCategories.misc;
  }

  if (!Array.isArray(message)) message = [message];

  if (env.NODE_ENV === "development")
    console.log(
      loggingColourCode.FgBlack,
      `[${new Date(Date.now()).toISOString().split("T")[1].substring(0, 12)}]`,
      category.color,
      `[${category.name}]`,
      color,
      ...message,
    );
}
