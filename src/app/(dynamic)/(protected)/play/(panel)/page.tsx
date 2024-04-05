"use client";

import { useState } from "react";

import { LobbyPanel } from "~/app/(dynamic)/(protected)/play/(panel)/_components/LobbyPanel";
import Panel from "~/app/(dynamic)/(protected)/play/_components/_panel/Panel";
import { ChallengeConfigurationContextProvider } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/ChallengeConfiguration.provider";

type Opponent = "online" | "friend";

/**
 * Gives uses opportunity to redirect to other panels.
 */
export default function DefaultPlayPanel() {
  const [opponent, setOpponent] = useState<Opponent>("friend");

  return (
    <ChallengeConfigurationContextProvider>
      <Panel
        subtitle="VS"
        content={{
          elements: {
            friend: <LobbyPanel />,
            online: <>Coming soon!</>,
          },
          default: "friend",
        }}
      />
    </ChallengeConfigurationContextProvider>
  );
}
