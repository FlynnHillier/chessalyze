import { WebSocket } from "ws";
import { ZodType, z } from "zod";
import { SocketRoom } from "~/lib/ws/rooms.ws";
import { AtleastOneKey } from "~/types/util/util.types";

/**
 *
 * @param eventID the eventID to emit with
 * @param data the data to emit
 * @param to who to emit the event to
 */
function emit<D extends any>( //TODO: make this type only serializable types
  eventID: string,
  data: D,
  to: AtleastOneKey<{
    room: SocketRoom;
    socket: WebSocket;
  }>,
) {
  const targetSockets = new Set<WebSocket>();

  to.room?.sockets().forEach((socket) => targetSockets.add(socket));
  if (to.socket) targetSockets.add(to.socket);

  targetSockets.forEach((socket) =>
    socket.send(
      JSON.stringify({
        event: eventID,
        data: data,
      }),
    ),
  );
}

/**
 * Given the generic type Record<string, ZodType> allow for construction of functions to emit type-safe data for given events.
 *
 * The keys within the provided Record type act as the 'eventIDs' in the emitted event.
 *
 * The associated zod types provided act as the type of the data payload for the given eventID
 */
export class WSMessagesTemplate<T extends Record<string, ZodType>> {
  private validators: T;

  /**
   *
   * @param validators an object with key value pairs representing the event name (key) and the associated payload structure (value)
   */
  constructor(validators: T) {
    this.validators = validators;
  }

  /**
   *
   * @param event a given eventID
   */
  public send<E extends Extract<keyof T, string>>(event: E) {
    return {
      /**
       *
       * @param data the data to send
       */
      data: (data: Parameters<typeof this.sendData<E>>[1]) => {
        return this.sendData(event, data);
      },
    };
  }

  private sendData<E extends Extract<keyof T, string>>(
    event: E,
    data: z.infer<T[E]>,
  ) {
    return {
      /**
       *
       * @param to who to send the data to
       * @returns
       */
      to: (to: Parameters<typeof this.sendDataTo<E>>[2]) => {
        return this.sendDataTo(event, data, to);
      },
    };
  }

  private sendDataTo<E extends Extract<keyof T, string>>(
    event: E,
    data: z.infer<T[E]>,
    to: AtleastOneKey<{
      room: SocketRoom;
      socket: WebSocket;
    }>,
  ) {
    return {
      /**
       * Broadcast the constructed message
       */
      emit: () => {
        emit(event, to, data);
      },
    };
  }

  public receiver(on: BuildReceiver<T>) {
    return (incomingMessage: string) => {
      try {
        const json = JSON.parse(incomingMessage);

        if (
          !json.event ||
          !json.data ||
          typeof json.event !== "string" ||
          !Object.keys(on).includes(json.event)
        )
          return;

        this.validators[json.event].parse(json.data);

        on[json.event]?.(json.data);
      } catch (e) {
        console.error(e); //TODO: change this
      }
    };
  }
}

type BuildReceiver<T extends Record<string, any>> = Partial<{
  [K in keyof T]: (arg: z.infer<T[K]>) => any;
}>;

export type ExtractWSMessageTemplateGeneric<T> =
  T extends WSMessagesTemplate<infer E> ? E : never;

/**
 * Extract the data type for a given event from a WSMessageTemplate class
 *
 * T - the template with the desired specified message event typings
 *
 * E - the event we want to extract the type for
 */
export type WSMessageData<
  T extends WSMessagesTemplate<any>,
  E extends keyof ExtractWSMessageTemplateGeneric<T>,
> = ExtractWSMessageTemplateGeneric<T>[E];
