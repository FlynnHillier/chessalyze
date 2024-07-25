import { trpc } from "~/app/_trpc/client";
import {
  ComponentProps,
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";
import { useWebSocket } from "next-ws/client";
import { ClassNameValue } from "tailwind-merge";
import { cn } from "~/lib/util/cn";
import { ScaleLoader } from "react-spinners";
import { useGlobalError } from "~/app/_components/providers/client/globalError.provider";
import { FaUserPlus, FaUserClock, FaUserCheck } from "react-icons/fa6";
import { FaUserTimes } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { Tooltip } from "react-tooltip";

type Target = {
  id: string;
};

type FriendRelationContextType = {
  relation:
    | "none"
    | "confirmed"
    | "request_outgoing"
    | "request_incoming"
    | undefined;
  setRelation: Dispatch<FriendRelationContextType["relation"]>;
};

const FriendRelationContext = createContext<FriendRelationContextType>(
  {} as FriendRelationContextType,
);

function useFriendRelation() {
  return useContext(FriendRelationContext);
}

/**
 * A standardised size/styled element to contain / visually represent a button
 *
 */
function SocialButtonContainer({
  children,
  isLoading,
  className,
  loadingColor,
  ...otherProps
}: {
  children?: ReactNode;
  isLoading: boolean;
  loadingColor?: string;
  className?: ClassNameValue;
  showCross?: boolean;
  onCrossClick?: () => any;
} & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-14 w-full flex-row flex-nowrap items-center justify-center overflow-hidden rounded bg-stone-600 text-center text-lg font-semibold",
        className,
      )}
      {...otherProps}
    >
      {isLoading ? (
        <ScaleLoader height={20} color={loadingColor ?? "gray"} />
      ) : (
        children
      )}
    </div>
  );
}

/**
 * A standardised size/styled element to contain / visually represent a button
 *
 */
function SocialButtonWithCrossRight({
  children,
  isLoading,
  className,
  onCrossClick,
  crossButtonClassName,
  tooltip,
  ...otherProps
}: {
  tooltip: {
    id: string;
    content: string;
  };
  children?: ReactNode;
  crossButtonClassName?: ClassNameValue;
  onCrossClick?: () => any;
} & ComponentProps<typeof SocialButtonContainer>) {
  return (
    <>
      <Tooltip id={tooltip.id} content={tooltip.content} />
      <SocialButtonContainer
        isLoading={isLoading}
        {...otherProps}
        className={cn(
          "flex flex-row flex-nowrap items-center justify-center gap-1 p-3",
          className,
        )}
      >
        {children}

        <button
          data-tooltip-id={tooltip.id}
          className={cn("ml-1", crossButtonClassName)}
          onClick={onCrossClick}
          disabled={isLoading}
        >
          <RxCross2 size={18} />
        </button>
      </SocialButtonContainer>
    </>
  );
}

/**
 * A standardised size/styled element to contain / visually represent a button
 *
 */
function SocialButtonFull({
  children,
  isLoading,
  className,
  ...otherProps
}: {
  children?: ReactNode;
} & ComponentProps<"button"> &
  ComponentProps<typeof SocialButtonContainer>) {
  return (
    <SocialButtonContainer isLoading={isLoading} {...otherProps}>
      <button
        className={cn(
          "flex h-full w-full flex-row flex-nowrap items-center justify-center gap-1 rounded p-3",
          className,
        )}
        disabled={isLoading}
      >
        {children}
      </button>
    </SocialButtonContainer>
  );
}

/**
 * Button to send friend request to target user
 */
function SocialSendFriendRequestButton({ target }: { target: Target }) {
  const { setRelation } = useFriendRelation();
  const { showGlobalError } = useGlobalError();

  const addFriendMutation = trpc.social.friend.request.send.useMutation({
    onSettled(data, error, variables, context) {
      if (data?.success) return setRelation("request_outgoing");
      if (error) showGlobalError(error.message);
    },
  });

  return (
    <SocialButtonFull
      isLoading={addFriendMutation.isLoading}
      onClick={() => {
        addFriendMutation.mutate({ targetUserID: target.id });
      }}
    >
      <FaUserPlus /> add friend
    </SocialButtonFull>
  );
}

/**
 * Button to handle existing outgoing friend request to target user
 */
function SocialHandleOutgoingFriendRequestButton({
  target,
}: {
  target: Target;
}) {
  const { setRelation } = useFriendRelation();
  const { showGlobalError } = useGlobalError();

  const cancelOutgoingFriendRequestMutation =
    trpc.social.friend.request.cancelOutgoing.useMutation({
      onSettled(data, error, variables, context) {
        console.log("cannceled outgoing");

        if (data?.success) return setRelation("none");
        if (error) showGlobalError(error.message);
      },
    });

  return (
    <SocialButtonWithCrossRight
      loadingColor="green"
      className={"bg-green-600"}
      tooltip={{
        id: "social-outgoing-request-tooltip",
        content: "cancel",
      }}
      isLoading={cancelOutgoingFriendRequestMutation.isLoading}
      onCrossClick={() => {
        cancelOutgoingFriendRequestMutation.mutate({ targetUserID: target.id });
      }}
    >
      <div className="flex flex-row flex-nowrap"></div>
      <FaUserClock />
      {"request sent"}
    </SocialButtonWithCrossRight>
  );
}

/**
 * Button to handle existing incoming friend request from target user
 */
function SocialHandleIncomingFriendRequestButton({
  target,
}: {
  target: Target;
}) {
  const { setRelation } = useFriendRelation();
  const { showGlobalError } = useGlobalError();

  const AcceptIncomingFriendRequestMutation =
    trpc.social.friend.request.acceptIncoming.useMutation({
      onSettled(data, error, variables, context) {
        if (data?.success) return setRelation("confirmed");
        if (error) showGlobalError(error.message);
      },
    });

  const RejectIncomingFriendRequestMutation =
    trpc.social.friend.request.rejectIncoming.useMutation({
      onSettled(data, error, variables, context) {
        if (data?.success) return setRelation("none");
        if (error) showGlobalError(error.message);
      },
    });

  return (
    <>
      <SocialButtonFull
        loadingColor="green"
        className={"bg-green-600"}
        isLoading={AcceptIncomingFriendRequestMutation.isLoading}
        disabled={
          RejectIncomingFriendRequestMutation.isLoading ||
          AcceptIncomingFriendRequestMutation.isLoading
        }
        onClick={() => {
          AcceptIncomingFriendRequestMutation.mutate({
            targetUserID: target.id,
          });
        }}
      >
        <FaUserPlus />
        accept
      </SocialButtonFull>
      <SocialButtonFull
        loadingColor="red"
        className={"bg-red-700"}
        isLoading={RejectIncomingFriendRequestMutation.isLoading}
        disabled={
          RejectIncomingFriendRequestMutation.isLoading ||
          AcceptIncomingFriendRequestMutation.isLoading
        }
        onClick={() => {
          RejectIncomingFriendRequestMutation.mutate({
            targetUserID: target.id,
          });
        }}
      >
        <FaUserTimes />
        reject
      </SocialButtonFull>
    </>
  );
}

/**
 * Button to handle existing friend relation with target user
 */
function SocialHandleExistingFriendButton({ target }: { target: Target }) {
  const { setRelation } = useFriendRelation();
  const { showGlobalError } = useGlobalError();

  const RemoveExistingFriendMutation =
    trpc.social.friend.request.remove.useMutation({
      onSettled(data, error, variables, context) {
        if (data?.success) return setRelation("none");
        if (error) showGlobalError(error.message);
      },
    });

  return (
    <SocialButtonWithCrossRight
      tooltip={{
        id: "social-remove-existing-friend-tooltip",
        content: "remove",
      }}
      loadingColor="green"
      className={"bg-green-600"}
      isLoading={RemoveExistingFriendMutation.isLoading}
      onCrossClick={() => {
        RemoveExistingFriendMutation.mutate({
          targetUserID: target.id,
        });
      }}
    >
      <FaUserCheck />
      friends
    </SocialButtonWithCrossRight>
  );
}

export function SocialInteractionButton({
  target,
  className,
}: {
  target: {
    id: string;
  };
  className?: ClassNameValue;
}) {
  const ws = useWebSocket();
  const queryFriendRelation = trpc.social.profile.friendRelation.useQuery({
    targetUserID: target.id,
  });
  const [relation, setRelation] = useState<
    "none" | "confirmed" | "request_outgoing" | "request_incoming" | undefined
  >();

  useEffect(() => {
    console.log(relation);
  }, [relation]);

  /**
   * Load initial friend relation
   */
  useEffect(() => {
    if (!queryFriendRelation.data) return;

    if (queryFriendRelation.data.relation === "none")
      return setRelation("none");
    if (queryFriendRelation.data.relation === "confirmed")
      return setRelation("confirmed");
    if (queryFriendRelation.data.relation === "requestIncoming")
      return setRelation("request_incoming");
    if (queryFriendRelation.data.relation === "requestOutgoing")
      return setRelation("request_outgoing");
  }, [queryFriendRelation.dataUpdatedAt]);

  /**
   * Update relation when updates are recieved via websocket
   */
  useEffect(() => {
    // update state when websocket events are received
    const onWSMessageEvent = (m: MessageEvent) => {
      wsServerToClientMessage.receiver({
        SOCIAL_PERSONAL_UPDATE: ({ playerID, new_status }) => {
          if (playerID === target.id) {
            if (new_status === "confirmed") setRelation("confirmed");
            else if (new_status === "none") setRelation("none");
            else if (new_status === "request_incoming")
              setRelation("request_incoming");
            else if (new_status === "request_outgoing")
              setRelation("request_outgoing");
          }
        },
      })(m.data);
    };

    ws?.addEventListener("message", onWSMessageEvent);

    return () => {
      ws?.removeEventListener("message", onWSMessageEvent);
    };
  }, [ws]);

  return (
    <FriendRelationContext.Provider value={{ relation, setRelation }}>
      <div
        className={cn(
          "flex h-fit w-56 flex-row flex-nowrap gap-2 overflow-hidden rounded bg-inherit",
          className,
        )}
      >
        {relation === undefined ? (
          <SocialButtonContainer isLoading={true} />
        ) : relation === "none" ? (
          <SocialSendFriendRequestButton target={target} />
        ) : relation === "request_outgoing" ? (
          <SocialHandleOutgoingFriendRequestButton target={target} />
        ) : relation === "request_incoming" ? (
          <SocialHandleIncomingFriendRequestButton target={target} />
        ) : (
          relation === "confirmed" && (
            <SocialHandleExistingFriendButton target={target} />
          )
        )}
      </div>
    </FriendRelationContext.Provider>
  );
}
