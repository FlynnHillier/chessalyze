import moment from "moment";
import { TIME_PRESET } from "~/constants/game";

/**
 * Store consistent status' to be displayed based on user activity
 */
export const SOCIAL_STATUS = {
  idle: {
    primary: "idle",
    secondary: "exploring chessalyze",
  },
  offline: {
    primary: "offline",
    secondary: (sinceMSEpoch: number) => {
      const relative = moment(sinceMSEpoch).fromNow();
      return `last seen ${relative}`;
    },
  },
  inGame: {
    primary: "in game",
    secondary: (
      details: Partial<{
        timed: {
          preset?: (typeof TIME_PRESET)[number];
        };
      }>,
    ) => {
      if (details.timed)
        return `timed ${details.timed.preset ? details.timed.preset + " " : ""}vs match`;

      return "untimed vs match";
    },
  },
} as const satisfies Record<
  string,
  {
    primary: string | ((...arg: any[]) => string);
    secondary?: string | ((...arg: any[]) => string);
  }
>;
