import { z } from "zod";
import {
  zNonVerboseLobbySnapshot,
  zVerboseLobbySnapshot,
} from "~/lib/zod/lobby/lobby.validators";

export type NonVerboseLobbySnapshot = z.infer<typeof zNonVerboseLobbySnapshot>;

export type VerboseLobbySnapshot = z.infer<typeof zVerboseLobbySnapshot>;
