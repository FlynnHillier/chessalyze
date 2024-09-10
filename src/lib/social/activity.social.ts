import { GameInstance } from "~/lib/game/GameInstance";
import { log } from "~/lib/logging/logger.winston";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import { getProfileViewSocketRoom } from "~/lib/ws/rooms/categories/profile.room.ws";
import _ from "lodash";
import { SocialActivity } from "~/types/social.types";
import { WebSocket } from "ws";

import { getUserConfirmedFriends } from "~/lib/drizzle/queries/social.queries.drizzle";
import { wsSocketRegistry } from "~/lib/ws/registry.ws";
import { getUserFriendsSockets } from "~/lib/ws/runtimeSocketCollections/userFriends.sockets";

class Activity {
  public constructor(public readonly userID: string) {}
  private activity: {
    online: boolean;
    game?: GameInstance;
  } = { online: false };

  private static AWAIT_HEARTBEAT_BEFORE_OFFLINE: number = 30000;

  private heartbeatTimeout: NodeJS.Timeout | undefined;

  public onHeartbeat() {
    clearTimeout(this.heartbeatTimeout);

    this.update({ online: true });

    this.heartbeatTimeout = setTimeout(() => {
      this.update({ online: false });
    }, Activity.AWAIT_HEARTBEAT_BEFORE_OFFLINE);
  }

  private events = {
    onActivityChange: async () => {
      log("activity").debug(
        `user '${this.userID} now ${this.activity.online ? "online" : "offline"} ${this.activity.game ? "in-game" : "no-game"}`,
      );

      const room = getProfileViewSocketRoom({ playerID: this.userID });

      if (room)
        wsServerToClientMessage
          .send("PROFILE_VIEW:ACTIVITY_STATUS_UPDATE")
          .data({
            playerID: this.userID,
            status: this.getSocialActivity(),
          })
          .to({
            room,
          })
          .emit();

      const sockets = await getUserFriendsSockets(this.userID);

      wsServerToClientMessage
        .send("SOCIAL:FRIEND_ACTIVITY_UPDATE")
        .data({
          targetUserID: this.userID,
          activity: this.getSocialActivity(),
        })
        .to({ socket: sockets })
        .emit();
    },
  };

  /**
   *
   * @param updateActivity activity to update
   */
  public update(updateActivity: Partial<Activity["activity"]>) {
    const previousActivity = this.activity;

    this.activity = {
      ...this.activity,
      ...updateActivity,
    };

    if (!_.isEqual(previousActivity, this.activity))
      this.events.onActivityChange();

    if (this.isAbsolutelyOffline()) {
      ActivityManager._eventHooks.onActivityReportOffline(this.userID);
    } else {
      ActivityManager._eventHooks.onActivityReportActive(this.userID, this);
    }
  }

  public isAbsolutelyOffline() {
    return !this.activity.online && !this.activity.game;
  }

  public getSocialActivity(): SocialActivity {
    if (this.activity.game)
      return {
        isOnline: true,
        game: this.activity.game.id,
        status: {
          primary: "in game",
        },
      };
    if (this.activity.online)
      return {
        isOnline: true,
        status: {
          primary: "idle",
          secondary: "exploring chessalyze",
        },
      };

    return {
      isOnline: false,
      status: {},
    };
  }
}

export class ActivityManager {
  private static instance: ActivityManager = new ActivityManager();

  protected constructor() {
    if (ActivityManager.instance) return ActivityManager.instance;
    ActivityManager.instance = this;
  }

  private activityMap: Map<string, Activity> = new Map();

  /**
   * To be hooked into by other components of the server, such that a user's activity can be updated when certain events occur
   */
  public static readonly _eventHooks = {
    /**
     *
     * run when activity reports self offline
     */
    onActivityReportOffline: (userID: string) => {
      ActivityManager.instance.activityMap.delete(userID);
    },
    /**
     *
     * run when activity reports self offline
     */
    onActivityReportActive: (userID: string, activity: Activity) => {
      ActivityManager.instance.activityMap.set(userID, activity);
    },
    /**
     * run on game start
     */
    onGameStart: (userID: string, game: GameInstance) => {
      ActivityManager.getActivity(userID).update({ game: game });
    },
    /**
     * run on game end
     */
    onGameEnd: (userID: string) => {
      ActivityManager.getActivity(userID).update({ game: undefined });
    },
    /**
     * run on heartbeat
     */
    onHeartbeat: (userID: string) => {
      ActivityManager.getActivity(userID).onHeartbeat();
    },
  } as const satisfies Record<
    `on${Capitalize<string>}`,
    (userID: string, ...args: any[]) => void
  >;

  public static getActivity(userID: string): Activity {
    return (
      ActivityManager.instance.activityMap.get(userID) ?? new Activity(userID)
    );
  }
}
