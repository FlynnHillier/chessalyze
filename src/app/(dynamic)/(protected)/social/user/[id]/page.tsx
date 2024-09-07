"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";
import { trpc } from "~/app/_trpc/client";
import {
  useDispatchProfile,
  useProfile,
} from "../../_components/profile.context";
import { cn } from "~/lib/util/cn";
import { PlayerRecentGameSummarys } from "../../_components/PlayerRecentGamesScroller";

/**
 * Page to view a user's social profile
 *
 */
export default function () {
  const router = useRouter();

  const { id } = useParams();
  const { showGlobalError } = useGlobalError();
  const dispatchProfile = useDispatchProfile();
  const { profile } = useProfile();

  const getUserProfileQuery = trpc.social.profile.user.target.useQuery(
    {
      targetUserID: id as string,
    },
    {
      onError(err) {
        showGlobalError(err.message);
      },
      onSuccess(data) {
        if (data.profile === undefined) {
          showGlobalError("User doesn't exist");
          return router.push("/social");
        }

        const { profile } = data;

        // Load target user profile information into context
        dispatchProfile({
          type: "LOAD_PROFILE",
          payload: {
            user: profile.user,
            activity: {
              status: {
                isOnline: profile.activity.isOnline,
                game: profile.activity.game,
                messages: {
                  primary: profile.activity.status.primary,
                  secondary: profile.activity.status.secondary,
                },
              },
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
    },
  );

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-stretch bg-stone-800",
      )}
    >
      <div className="absolute left-0 top-0 box-border h-full w-full">
        <div className="mb-3 bg-stone-800 px-3 pb-3 pt-3 shadow-xl">
          <div className="flex flex-col flex-nowrap gap-1.5">
            {!profile ? (
              <>
                <div className="inline-block h-10 w-32 animate-pulse rounded-sm bg-stone-600" />
                <div className="inline-block h-8 w-48 animate-pulse rounded-sm bg-stone-600" />
              </>
            ) : (
              profile && (
                <>
                  <div className="flex w-fit flex-row flex-nowrap items-baseline gap-x-1.5">
                    <span className="inline-block text-4xl font-bold">
                      {profile.activity.status.isOnline ? "online" : "offline"}
                    </span>
                    <span
                      className={cn("inline-block h-5 w-5 rounded-full", {
                        "bg-green-600": profile.activity.status.isOnline,
                        "bg-red-600": !profile.activity.status.isOnline,
                      })}
                    />
                  </div>
                  <span className="text-lg font-semibold">
                    {profile?.activity.status.messages.primary}{" "}
                    {profile?.activity.status.messages.primary &&
                      profile.activity.status.messages.secondary &&
                      `- ${profile.activity.status.messages.secondary}`}
                  </span>
                </>
              )
            )}
          </div>
        </div>
        <div className="mt-3 h-5/6 px-5">
          <div className="mb-2 w-full text-2xl font-semibold">
            Match History
          </div>
          <hr className="my-2 border-stone-700" />

          {/* TODO: the height is sorted of cheated here */}
          {profile && (
            <PlayerRecentGameSummarys profile={{ id: profile?.user.id }} />
          )}
        </div>
      </div>
    </div>
  );
}
