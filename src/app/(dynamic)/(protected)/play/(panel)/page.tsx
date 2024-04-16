"use client";

import Panel from "~/app/(dynamic)/(protected)/play/(panel)/_components/Panel";
import { ChallengeConfigurationContextProvider } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/ChallengeConfiguration.provider";
import { CreateChallenge } from "~/app/(dynamic)/(protected)/play/(panel)/_components/panels/CreateChallenge";
import { useEffect } from "react";
import { useGame } from "~/app/_components/providers/game.provider";
import { useRouter } from "next/navigation";

/**
 * Gives uses opportunity to redirect to other panels.
 */
export default function DefaultPlayPanel() {
  const game = useGame();
  const router = useRouter();

  useEffect(()=>{
    if(game.present) router.push("/play/live")
  },[game.present])



  return (
    <ChallengeConfigurationContextProvider>
      <Panel
        subtitle="VS"
        content={{
          elements: {
            friend: <CreateChallenge />,
            online: <>Coming soon!</>,
          },
          default: "friend",
        }}
      />
    </ChallengeConfigurationContextProvider>
  );
}
