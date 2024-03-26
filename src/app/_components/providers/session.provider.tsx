"use client";

import { Session, User } from "lucia";
import {
  Dispatch,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

const SessionContext = createContext<{
  setSession: Dispatch<Session | null>;
  setUser: Dispatch<User | null>;
  session: Session | null;
  user: User | null;
}>({
  setUser: () => {},
  setSession: () => {},
  session: null,
  user: null,
});

/**
 * get session information about the current user
 *
 */
export function useSession(): { user: User | null; session: Session | null } {
  const { user, session } = useContext(SessionContext);
  return {
    user,
    session,
  };
}

/**
 * mutate session state (useful after a login / logout event?)
 *
 */
export function useMutateSession(): {
  mutateUser: Dispatch<User | null>;
  mutateSession: Dispatch<Session | null>;
} {
  const { setUser, setSession } = useContext(SessionContext);
  return {
    mutateUser: setUser,
    mutateSession: setSession,
  };
}

export default function SessionProvider({
  session,
  user,
  children,
}: {
  session: Session | null;
  user: User | null;
  children: ReactNode;
}) {
  const [userState, setUserState] = useState<User | null>(user);
  const [sessionState, setSessionState] = useState<Session | null>(session);

  return (
    <SessionContext.Provider
      value={{
        session: sessionState,
        setSession: setSessionState,
        user: userState,
        setUser: setUserState,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
