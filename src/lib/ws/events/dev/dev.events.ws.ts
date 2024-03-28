import { DevIDEvent } from "~/lib/ws/events/dev/dev.id.event.ws";
import { DevTestEvent } from "~/lib/ws/events/dev/dev.test.ws";

export enum DevEvent {
  DEV_ID = "DEV_ID",
  DEV_TEST = "DEV_TEST",
}

export type DevEmitEvent = DevIDEvent | DevTestEvent;
