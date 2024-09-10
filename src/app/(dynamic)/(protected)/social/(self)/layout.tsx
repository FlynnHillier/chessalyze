"use client";

import { ReactNode } from "react";
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";
import { trpc } from "~/app/_trpc/client";
import { useDispatchProfile } from "../_components/profile.context";

export default function ({ children }: { children: ReactNode }) {
  const { showGlobalError } = useGlobalError();
  const dispatchProfile = useDispatchProfile();

  const getOwnProfileQuery = trpc.social.profile.user.self.useQuery(undefined, {
    onSuccess(data) {
      const { profile } = data;
      if (!profile) showGlobalError("user does not exist", 1000 * 60);
      else
        dispatchProfile({
          type: "LOAD_PROFILE",
          payload: {
            user: {
              id: profile.user.id,
              imageURL: profile.user.imageURL,
              username: profile.user.username,
            },
            stats: {
              won: {
                total: profile.stats.games.won.total,
                asBlack: profile.stats.games.won.asBlack,
                asWhite: profile.stats.games.won.asWhite,
              },
              lost: {
                total: profile.stats.games.lost.total,
                asBlack: profile.stats.games.lost.asBlack,
                asWhite: profile.stats.games.lost.asWhite,
              },
              drawn: {
                total: profile.stats.games.drawn.total,
                asBlack: profile.stats.games.drawn.asBlack,
                asWhite: profile.stats.games.drawn.asWhite,
              },
              all: {
                total: profile.stats.games.all.total,
                asBlack: profile.stats.games.all.asBlack,
                asWhite: profile.stats.games.all.asWhite,
              },
            },
            activity: {
              status: {
                isOnline: profile.activity.isOnline,
                messages: {
                  primary: profile.activity.status.primary,
                  secondary: profile.activity.status.secondary,
                },
              },
            },
            friend: profile.friend &&
              profile.friend.relation && {
                status:
                  profile.friend.relation === "confirmed"
                    ? "confirmed"
                    : profile.friend.relation === "requestIncoming"
                      ? "request_incoming"
                      : profile.friend.relation === "requestOutgoing"
                        ? "request_outgoing"
                        : "none",
              },
          },
        });
    },
    onError(err) {
      showGlobalError(err.message);
    },
  });

  return <>{children}</>;
}
