"use client";

import Panel from "~/app/(dynamic)/(protected)/play/(panel)/_components/Panel";
import { ChallengeConfigurationContextProvider } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/ChallengeConfiguration.provider";
import { CreateAndConfigureLobbyInterface } from "~/app/(dynamic)/(protected)/play/(panel)/_components/panels/CreateChallenge";
import { JoinChallengeInterface } from "../_components/panels/JoinChallenge";

/**
 * Gives uses opportunity to redirect to other panels.
 */
export default function DefaultPlayPanel() {
  return (
    <ChallengeConfigurationContextProvider>
      <Panel
        subtitle="VS"
        content={{
          elements: {
            create: <CreateAndConfigureLobbyInterface />,
            join: <JoinChallengeInterface />,
          },
          default: "create",
        }}
      />
    </ChallengeConfigurationContextProvider>
  );
}
