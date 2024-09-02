"use client";

import { resizeGoogleProfilePictureURL } from "~/lib/lucia/misc/profile.imageResize";
import { useRouter } from "next/navigation";
import { NonVerboseLobbySnapshot } from "~/types/lobby.types";
import { toast } from "react-toastify";

/**
 * Standardised string constructor for toastify lobby invite notifications
 */
export const TOAST_ID_LOBBY_INV = (lobbyID: string) =>
  `LOBBY_INVITE:${lobbyID}`;

export function RecievedInviteLobbyNotification({
  from,
  lobby,
}: {
  from: { username: string; imageURL?: string; id: string };
  lobby: NonVerboseLobbySnapshot;
}) {
  const router = useRouter();

  function goToLobbyPreview() {
    router.push(`/play/join?challenge=${lobby.id}`);
  }

  function hideSelfNotificication() {
    toast.dismiss(TOAST_ID_LOBBY_INV(lobby.id));
  }

  return (
    <div className="flex flex-row flex-nowrap">
      <div className="flex flex-grow flex-col gap-0.5">
        <div className="h-1/2">
          <span className="text-lg font-semibold">Game invite recieved</span>
        </div>
        <div className="flex h-1/2 flex-row flex-nowrap gap-2">
          <div
            className={
              "box-border aspect-square h-10 overflow-hidden rounded bg-stone-600"
            }
          >
            <img
              className="bg-cover"
              src={
                from.imageURL
                  ? resizeGoogleProfilePictureURL(from.imageURL, 200)
                  : "/blankuser.png"
              }
            />
          </div>
          <div className="flex-grow">
            <span className="text-base">{from.username}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-1">
        <button
          className="mr-2 rounded bg-green-600 p-2 font-semibold"
          onClick={() => {
            hideSelfNotificication();
            goToLobbyPreview();
          }}
        >
          view
        </button>
      </div>
    </div>
  );
}
