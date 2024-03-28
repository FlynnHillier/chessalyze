import { env } from "~/env";

/**
 * Logs specified message only if NODE_ENV enviroment variable is set to 'development'
 * @param message message to log
 */
export function logDev(...message: any[]) {
  if (env.NODE_ENV === "development") console.log(...message);
}
