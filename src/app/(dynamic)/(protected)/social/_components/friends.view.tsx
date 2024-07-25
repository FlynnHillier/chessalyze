import { trpc } from "~/app/_trpc/client";
import {
  createContext,
  Dispatch,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useWebSocket } from "next-ws/client";
import { cn } from "~/lib/util/cn";
import { ComponentProps } from "react";
import { ClipLoader, MoonLoader } from "react-spinners";
import { Tooltip } from "react-tooltip";
import { resizeGoogleProfilePictureURL } from "~/lib/lucia/misc/profile.imageResize";
import { FaUserXmark, FaChessBoard } from "react-icons/fa6";
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";
import { ReducerAction } from "~/types/util/context.types";

type User = {
  id: string;
  username: string;
  imageURL?: string;
};

type AllFriends = Record<User["id"], User>;

type FriendsContextType = {
  dispatchFriends: Dispatch<FriendReducerAction>;
  friends: AllFriends | undefined;
};

const AllFriendsContext = createContext<FriendsContextType>(
  {} as FriendsContextType,
);

function useAllFriendsContext() {
  return useContext(AllFriendsContext);
}

type FriendReducerAction =
  | ReducerAction<"LOAD", AllFriends>
  | ReducerAction<
      "UPDATE_EXISTING",
      { id: string; updates: Partial<Omit<User, "id">> }
    >
  | ReducerAction<"REMOVE", { id: string }>;

function allFriendsReducer<A extends FriendReducerAction>(
  state: AllFriends,
  action: A,
): AllFriends {
  const { type, payload } = action;

  switch (type) {
    case "LOAD": {
      return {
        ...payload,
      };
    }
    case "UPDATE_EXISTING": {
      if (!state[payload.id]) return { ...state };
      return {
        ...state,
        [payload.id]: {
          ...state[payload.id],
          ...payload.updates,
        },
      };
    }
    case "REMOVE": {
      delete state[payload.id];
      return {
        ...state,
      };
    }
  }
}

export function AllExistingFriends({
  className,
}: {
  className?: ComponentProps<"div">["className"];
}) {
  const ws = useWebSocket();
  const { showGlobalError } = useGlobalError();

  const [friends, dispatchFriends] = useReducer(allFriendsReducer, {});

  const queryConfirmedFriends = trpc.social.friend.getAllFriends.useQuery(
    undefined,
    {
      onSettled(data, error) {
        if (data) {
          dispatchFriends({
            type: "LOAD",
            payload: data.reduce(
              (acc, { id, image, name }) => ({
                ...acc,
                [id]: {
                  id,
                  imageURL: image,
                  username: name,
                },
              }),
              {},
            ),
          });
        }
      },
    },
  );

  return (
    <AllFriendsContext.Provider
      value={{
        dispatchFriends,
        friends,
      }}
    >
      <div
        className={cn(
          "flow flex h-full max-h-full w-full flex-col rounded",
          className,
        )}
      >
        <div className="mb-3 flex w-full flex-shrink flex-grow-0 basis-auto text-nowrap px-3 text-2xl font-semibold">
          Friends
        </div>

        <div className="flex flex-grow overflow-y-auto">
          <div
            className={cn(
              "flex h-fit flex-row flex-wrap items-start gap-3 overflow-y-auto px-3 pb-5",
            )}
          >
            {friends === undefined || queryConfirmedFriends.isLoading ? (
              <MoonLoader />
            ) : queryConfirmedFriends.isError ? (
              "something went wrong"
            ) : Object.keys(friends).length === 0 ? (
              "no friends to see here. try adding some."
            ) : (
              Object.values(friends).map(({ id }) => (
                <ExistingFriendPill id={id} />
              ))
            )}
          </div>
        </div>
      </div>
    </AllFriendsContext.Provider>
  );
}

function ExistingFriendPill({ id }: { id: User["id"] }) {
  const { friends, dispatchFriends } = useAllFriendsContext();

  const { showGlobalError } = useGlobalError();

  const removeConfirmedFriendMutation =
    trpc.social.friend.request.remove.useMutation({
      onSettled(data, error, variables, context) {
        if (error) return showGlobalError(error.message);
        if (data) {
          if (data.success) {
            dispatchFriends({
              type: "REMOVE",
              payload: {
                id,
              },
            });
          }
        }
      },
    });

  useEffect(() => {}, [id, friends]);

  const TOOLTIP_ID = {
    challenge: "tooltip-social-challenge_" + id,
    remove: "tooltip-social-remove_" + id,
  };

  return (
    friends?.[id] && (
      <>
        <Tooltip
          id={TOOLTIP_ID.challenge}
          content="challenge"
          className="z-10"
        />
        <Tooltip
          id={TOOLTIP_ID.remove}
          content="remove friend"
          className="z-10"
        />
        <div className="flex h-20 w-full min-w-64 flex-row  flex-nowrap justify-start gap-2 rounded p-2 shadow-lg shadow-stone-900 hover:bg-stone-900 lg:w-[calc(50%-(0.75rem/2))]  xl:w-[calc(32.8%-0.25rem)]  ">
          <div className="relative aspect-square w-16 flex-shrink-0">
            <img
              className="left-0 top-0 h-full w-full overflow-hidden rounded bg-cover"
              alt={`${friends[id].username}'s profile picture`}
              src={
                friends[id].imageURL
                  ? resizeGoogleProfilePictureURL(friends[id].imageURL, 100)
                  : "/blankuser.png"
              }
            />
            <span
              className={cn(
                "absolute -bottom-1 -right-1 z-[0] inline-block aspect-square w-5 rounded-full",
                { "bg-green-600": true, "bg-red-700": true },
              )}
            />
          </div>
          <div className="flex flex-grow flex-col justify-between overflow-hidden whitespace-nowrap">
            <span className="inline-block text-ellipsis whitespace-nowrap text-xl font-semibold">
              {friends[id].username}
            </span>
            <div className="flex h-1/2 flex-row flex-nowrap items-start gap-1.5 text-xl">
              <button
                className="border-none"
                onClick={() => {}}
                disabled={removeConfirmedFriendMutation.isLoading}
              >
                {false ? (
                  <ClipLoader size={5} />
                ) : (
                  <FaChessBoard data-tooltip-id={TOOLTIP_ID.challenge} />
                )}
              </button>

              <button
                onClick={() => {
                  removeConfirmedFriendMutation.mutate({
                    targetUserID: id,
                  });
                }}
                disabled={removeConfirmedFriendMutation.isLoading}
                data-tooltip-id={TOOLTIP_ID.remove}
              >
                {removeConfirmedFriendMutation.isLoading ? (
                  <ClipLoader size={20} color="gray" />
                ) : (
                  <FaUserXmark />
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  );
}
