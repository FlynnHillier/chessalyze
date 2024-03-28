import { GameEmitEvent } from "~/lib/ws/events/game/game.events.ws";
import { DevEmitEvent } from "~/lib/ws/events/dev/dev.events.ws";

export type EmitEvent = GameEmitEvent | DevEmitEvent;
