import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { trpc } from "~/app/_trpc/client";

type GameResultsStat = {
  asWhite: number;
  asBlack: number;
  total: number;
};

/**
 * the structure of data included in the profile view context
 */
type ProfileData = {
  user: {
    id: string;
    imageURL: string | null;
    username: string;
  };
  stats: {
    lost: GameResultsStat;
    won: GameResultsStat;
    drawn: GameResultsStat;
    all: GameResultsStat;
  };
};

const PROFILEVIEWCONTEXT = createContext<{
  isLoading: boolean;
  profile?: ProfileData;
}>({} as { profile?: ProfileData; isLoading: boolean });

/**
 *
 * Provide details regarding a user profile to child components
 */
export function ProfileViewProvider({
  children,
  target,
}: {
  children: ReactNode;
  target: { id: string };
}) {
  const loadProfileInformationQuery = trpc.social.profile.user.useQuery({
    targetUserID: target.id,
  });

  const [profileInformation, setProfileInformation] = useState<{
    profile?: ProfileData;
    isLoading: boolean;
  }>({
    isLoading: true,
    profile: undefined,
  });

  useEffect(() => {
    setProfileInformation((p) => ({
      ...p,
      isLoading: loadProfileInformationQuery.isLoading,
    }));
  }, [loadProfileInformationQuery.isLoading]);

  useEffect(() => {
    if (loadProfileInformationQuery.data) {
      const { profile, stats } = loadProfileInformationQuery.data;
      const { won, lost, drawn, all } = stats.games;
      setProfileInformation({
        isLoading: false,
        profile: {
          user: {
            id: profile.id,
            imageURL: profile.imageURL,
            username: profile.username,
          },
          stats: {
            won: {
              total: won.total,
              asBlack: won.asBlack,
              asWhite: won.asWhite,
            },
            lost: {
              total: lost.total,
              asBlack: lost.asBlack,
              asWhite: lost.asWhite,
            },
            drawn: {
              total: drawn.total,
              asBlack: drawn.asBlack,
              asWhite: drawn.asWhite,
            },
            all: {
              total: all.total,
              asBlack: all.asBlack,
              asWhite: all.asWhite,
            },
          },
        },
      });
    }
  }, [loadProfileInformationQuery.data]);

  return (
    <PROFILEVIEWCONTEXT.Provider value={profileInformation}>
      {children}
    </PROFILEVIEWCONTEXT.Provider>
  );
}

export function useProfileInformation() {
  return useContext(PROFILEVIEWCONTEXT);
}
