import { GameInstance } from "~/lib/game/GameInstance";
import { log } from "~/lib/logging/logger.winston";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import { SocketRoom } from "~/lib/ws/rooms.ws";
import { getProfileViewSocketRoom } from "~/lib/ws/rooms/categories/profile.room.ws";
import _ from "lodash";

/**
 * activity information for server-side use
 */
type PrivateActivityStatus = {
  online?: boolean;
  game?: GameInstance;
};

/**
 * activity information to be exposed to the client
 */
type ExposableActivityStatus = {
  isOnline: boolean;
  messages: {
    primary?: string;
    secondary?: string;
  };
};

export class ActivityManager {
  private static instance: ActivityManager = new ActivityManager();
  private static CONSIDER_USER_OFFLINE_AFTER_MS: number = 15000;

  protected constructor() {
    if (ActivityManager.instance) return ActivityManager.instance;
    ActivityManager.instance = this;
  }

  private activityMap: Map<string, PrivateActivityStatus> = new Map();
  private heartbeatTimeoutMap: Map<string, NodeJS.Timeout> = new Map();

  /**
   * To be hooked into by other components of the server, such that a user's activity can be updated when certain events occur
   */
  public static readonly _eventHooks = {
    /**
     * run on game start
     */
    onGameStart: (userID: string, game: GameInstance) => {
      ActivityManager.instance.update(userID, { game: game });
    },
    /**
     * run on game end
     */
    onGameEnd: (userID: string) => {
      ActivityManager.instance.update(userID, { game: undefined });
    },
    /**
     * run on heartbeat
     */
    onHeartbeat: (userID: string) => {
      clearTimeout(ActivityManager.instance.heartbeatTimeoutMap.get(userID));
      ActivityManager.instance.update(userID, { online: true });

      const timeout = setTimeout(() => {
        ActivityManager.instance.update(userID, { online: false });
        ActivityManager.instance.heartbeatTimeoutMap.delete(userID);
      }, ActivityManager.CONSIDER_USER_OFFLINE_AFTER_MS);

      ActivityManager.instance.heartbeatTimeoutMap.set(userID, timeout);
    },
  } as const satisfies Record<
    `on${Capitalize<string>}`,
    (userID: string, ...args: any[]) => void
  >;

  /**
   * get status information intended to be exposed to the client, regarding the user specified.
   *
   * @param userID target user's id
   * @returns client-exposable activity status information regarding the user specified
   */
  public static getExposableStatus(userID: string): ExposableActivityStatus {
    const activity = ActivityManager.instance.activityMap.get(userID);

    return ActivityManager.evaluateExposableStatusFromActivity(activity);
  }

  public static getServerSideStatus(
    userID: string,
  ): PrivateActivityStatus | undefined {
    return ActivityManager.instance.activityMap.get(userID);
  }

  /**
   *
   * @param userID userID to target
   * @param updateActivity activity to update
   */
  private update(
    userID: string,
    updateActivity: Partial<PrivateActivityStatus>,
  ) {
    const existingActivity = this.activityMap.get(userID);
    const newActivityStatus: PrivateActivityStatus = {
      ...(existingActivity ?? {}),
      ...updateActivity,
    };

    if (!newActivityStatus.game && !newActivityStatus.online)
      this.clearActivityEntry(userID);
    else this.activityMap.set(userID, newActivityStatus);

    this.pingOnActivityChange(userID, {
      new: this.activityMap.get(userID),
      previous: existingActivity,
    });
  }

  private clearActivityEntry(userID: string) {
    this.activityMap.delete(userID);
  }

  /**
   * Carry out necessary logic if activity status is considered to have changed between updates
   *
   * @param userID id of user in question
   * @param newActivity new activity
   * @param previousActivity previous activity
   */
  private pingOnActivityChange(
    userID: string,
    activity: {
      new?: PrivateActivityStatus;
      previous?: PrivateActivityStatus;
    },
  ) {
    const newActivityEvaluation =
      ActivityManager.evaluateExposableStatusFromActivity(activity.new);
    const previousActivityEvaluation =
      ActivityManager.evaluateExposableStatusFromActivity(activity.previous);

    const statusMessage = (activity?: PrivateActivityStatus) => {
      return `${activity?.online ? "online" : "offline"} ${activity?.game ? "in-game" : "no-game"}`;
    };

    if (!_.isEqual(newActivityEvaluation, previousActivityEvaluation)) {
      log("activity").debug(
        `user '${userID}' activity changed from '${statusMessage(activity.previous)}' to '${statusMessage(activity.new)}'`,
      );
      wsServerToClientMessage
        .send("PROFILE_VIEW:ACTIVITY_STATUS_UPDATE")
        .data({
          playerID: userID,
          status: newActivityEvaluation,
        })
        .to({
          room:
            getProfileViewSocketRoom({ playerID: userID }) ?? new SocketRoom(),
        })
        .emit();
    }
  }

  /**
   * generate exposable status information object based on actual activity information
   *
   * @param activity new activity
   * @returns client-exposable status information based on user activity
   */
  private static evaluateExposableStatusFromActivity(
    activity?: PrivateActivityStatus,
  ): ExposableActivityStatus {
    if (!activity)
      return {
        isOnline: false,
        messages: {},
      };

    if (activity.game) {
      const timeData = activity.game.getTimeData();

      return {
        isOnline: true,
        messages: {
          primary: "in game",
          secondary: timeData.clock
            ? `timed ${timeData.clock.initial.template && `${timeData.clock.initial.template}`}`
            : "un-timed",
        },
      };
    }

    return {
      isOnline: true,
      messages: {
        primary: "idle",
        secondary: "exploring chessalyze",
      },
    };
  }
}
