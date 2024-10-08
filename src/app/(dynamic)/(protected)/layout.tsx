import { ReactNode } from "react";
import { FriendsProvider } from "~/app/_components/providers/client/friends.provider";
import { LobbyProvider } from "~/app/_components/providers/client/lobby.provider";
import ServerGameProvider from "~/app/_components/providers/server/server.game.provider";
import { redirectIfNotAuthed } from "~/app/_controllers/auth/auth.controllers";

export default async function RestrictedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await redirectIfNotAuthed("/login");

  return (
    <FriendsProvider>
      <LobbyProvider>
        <ServerGameProvider>{children}</ServerGameProvider>
      </LobbyProvider>
    </FriendsProvider>
  );
}
