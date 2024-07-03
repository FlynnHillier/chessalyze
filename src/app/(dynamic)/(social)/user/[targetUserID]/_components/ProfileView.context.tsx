import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

type GameResultsStat = {
  asWhite: number;
  asBlack: number;
  total: number;
};

/**
 * the structure of data included in the profile view context
 */
type Data = Partial<{
  profile: {
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
}>;

/**
 * A type that constructs an object of associated dispatchers for the data defined in the data type
 */
type Dispatchers = {
  [K in keyof Required<Data> as `set${Capitalize<K>}`]: Dispatch<Data[K]>;
};

const PROFILEVIEWCONTEXT = createContext<{
  data: Data;
  dispatch: Dispatchers;
}>(
  {} as {
    data: Data;
    dispatch: Dispatchers;
  },
);

/**
 *
 * Provide details regarding a user profile to child components
 */
export function ProfileViewProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Data["profile"]>(undefined);
  const [stats, setStats] = useState<Data["stats"]>(undefined);

  return (
    <PROFILEVIEWCONTEXT.Provider
      value={{
        data: {
          profile,
          stats,
        },
        dispatch: {
          setProfile: setProfile,
          setStats: setStats,
        },
      }}
    >
      {children}
    </PROFILEVIEWCONTEXT.Provider>
  );
}

export function useProfileView() {
  return useContext(PROFILEVIEWCONTEXT).data;
}

export function useDispatchProfileView() {
  return useContext(PROFILEVIEWCONTEXT).dispatch;
}
