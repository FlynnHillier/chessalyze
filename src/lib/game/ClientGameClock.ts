import { BW, Color } from "~/types/game.types";
import { AtleastOneKey } from "~/types/util/util.types";

/**
 * Class that easily allows for registering and de-registering of specified events
 */
abstract class EventClass<
  E extends { [key: string]: (...args: any[]) => any },
> {
  private readonly events: { [K in keyof E]: Set<E[K]> };

  protected constructor(events: { [K in keyof E]: Set<E[K]> }) {
    this.events = events;
  }

  /**
   * Register a callback to be ran when event occurs.
   *
   * @param event a given event
   * @param cb callback to run when event specified occurs
   */
  public registerEvent<T extends keyof E>(event: T, cb: E[T]) {
    this.events[event].add(cb);
  }

  /**
   * De-register a registered callback to be ran when event occurs.
   *
   * @param event a given event
   * @param cb callback to no longer be ran when event specified occurs
   */
  public deregisterEvent<T extends keyof E>(event: T, cb: E[T]) {
    this.events[event].delete(cb);
  }

  /**
   * Call a given event with the specified arguments
   *
   * @param event event to call
   * @param args arguments to be passed to the registered event callbacks
   */
  protected event<T extends keyof E>(event: T, ...args: Parameters<E[T]>) {
    this.events[event].forEach((cb) => cb(...args));
  }
}

type TickerEventSignatures = {
  onTick: (remaining: number) => any;
  onTimeout: () => any;
  onDurationChange: (remaining: number) => any;
};

/**
 * Timer that uses interval to keep a pseudo accurate refernce to value of elapsed time
 */
export class ClientIntervalTick extends EventClass<TickerEventSignatures> {
  private interval: NodeJS.Timeout | null = null;
  private lastTick: number | null = null;
  private tickIntervalMS: number;
  private timedOut: boolean = false;
  private duration: {
    initial: number;
    remaining: number;
  };

  public constructor(
    duration: number,
    {
      tickIntervalMS,
      activate,
      events,
    }: {
      activate?: boolean;
      tickIntervalMS?: number;
      events?: Partial<{
        [K in keyof TickerEventSignatures]: TickerEventSignatures[K][];
      }>;
    } = {},
  ) {
    super({
      onTick: new Set(events?.onTick),
      onTimeout: new Set(events?.onTimeout),
      onDurationChange: new Set(events?.onDurationChange),
    });

    this.duration = {
      initial: duration,
      remaining: duration,
    };

    this.tickIntervalMS = tickIntervalMS ?? 1000;
    if (activate) {
      this.activate();
    }
  }

  public isActive(): boolean {
    return this.interval !== null;
  }

  public isTimedOut(): boolean {
    return this.timedOut;
  }

  /**
   * Activate the clock.
   *
   */
  public activate(): boolean {
    if (this.interval || this.isTimedOut()) return false;

    this.interval = setInterval(this._onTick.bind(this), this.tickIntervalMS);
    return true;
  }

  /**
   * Deactivate the clock
   *
   */
  public deactivate() {
    if (!this.interval) return;

    clearInterval(this.interval);

    if (this.lastTick) {
      // handle sub-interval time difference
      this.setDuration(this.duration.remaining - (Date.now() - this.lastTick));
      this.lastTick = null;
    }
  }

  /**
   * update the clock's duration
   *
   * @param duration new duration
   */
  public setDuration(duration: number) {
    if (this.timedOut) return;

    this.duration.remaining = Math.max(0, duration);

    this.event("onDurationChange", this.duration.remaining);

    if (this.duration.remaining <= 0) this._onTimeout();
  }

  /**
   * Change the interval at which the ticker ticks
   *
   * Will auto resume clock if was active.
   *
   * @param tickIntervalMS new tick interval in ms
   */
  public setTickIntervalMS(tickIntervalMS: number) {
    const restart = this.isActive();

    this.deactivate();
    this.setTickIntervalMS(tickIntervalMS);
    if (restart) this.activate();
  }

  /**
   * Ran when ticker times out
   */
  private _onTimeout() {
    this.deactivate();

    if (!this.isTimedOut) {
      this.timedOut = true;
      this.event("onTimeout");
    }
  }

  /**
   * Ran when ticker 'ticks'
   */
  private _onTick() {
    this.lastTick = Date.now();
    this.setDuration(this.duration.remaining - this.tickIntervalMS);

    if (!this.isTimedOut()) this.event("onTick", this.duration.remaining);
  }
}

/**
 * Event signatures for ClientChessClock
 */
type ClientChessClockEventSignatures = {
  onTimeout: (color: Color) => any;
  onTick: (color: Color, remaining: AtleastOneKey<BW<number>>) => any;
  onDurationChange: (color: Color, remaining: AtleastOneKey<BW<number>>) => any;
};

/**
 * A chess clock that is to be ran on the client-side
 *
 * Uses an interval to intermitetantly update time, with callbacks allowing for state updates
 */
export class ClientChessClock extends EventClass<ClientChessClockEventSignatures> {
  private readonly tickers: BW<ClientIntervalTick>;
  private active: Color | false = false;
  private timedOut: boolean = false;
  public constructor(
    duration: BW<number>,
    {
      start,
      tickInterval,
      events,
    }: {
      start?: Color;
      tickInterval?: number;
      events?: Partial<{
        [K in keyof ClientChessClockEventSignatures]: ClientChessClockEventSignatures[K][];
      }>;
    } = {},
  ) {
    super({
      onTimeout: new Set(events?.onTimeout),
      onTick: new Set(events?.onTick),
      onDurationChange: new Set(events?.onDurationChange),
    });
    this.tickers = {
      w: new ClientIntervalTick(duration.w, {
        tickIntervalMS: tickInterval,
        events: {
          onTimeout: [
            () => {
              this._onTimeout("w");
            },
          ],
          onTick: [
            (remaining) => {
              this._onTick("w", { w: remaining });
            },
          ],
          onDurationChange: [
            (remaining) => {
              this._onDurationChange("w", {
                w: remaining,
              });
            },
          ],
        },
      }),
      b: new ClientIntervalTick(duration.b, {
        tickIntervalMS: tickInterval,
        events: {
          onTimeout: [
            () => {
              this._onTimeout("b");
            },
          ],
          onTick: [
            (remaining) => {
              this._onTick("b", { b: remaining });
            },
          ],
          onDurationChange: [
            (remaining) => {
              this._onDurationChange("b", {
                b: remaining,
              });
            },
          ],
        },
      }),
    };

    if (start) this.activate(start);
  }

  /**
   *
   * @returns true if one of the clock's tickers has timed out
   */
  public isTimedOut(): boolean {
    return this.timedOut;
  }

  /**
   *
   * @returns true if one of the clock's tickers is active
   */
  public isActive(): boolean {
    return !!this.active;
  }

  /**
   * Start the clock's ticker with the color specified
   *
   * @param color the color ticker to begin
   */
  public activate(color: Color): boolean {
    if (this.isTimedOut() || this.isActive()) return false;

    this.active = color;
    return this.tickers[color].activate();
  }

  /**
   * Deactivate the clock if active
   *
   */
  public deactivate() {
    if (!this.active) return;

    this.tickers[this.active].deactivate();
    this.active = false;
  }

  /**
   * Switch the clock to the other ticker, or the color specified. Only if clock is active
   *
   * @param color the color ticker to begin
   */
  public switch(to?: Color): boolean {
    if (!this.active) return false;

    if (this.active === to) return false;

    to = to ? to : this.active === "b" ? "w" : "b";

    this.deactivate();
    return this.activate(to);
  }

  public setDuration(duration: AtleastOneKey<BW<number>>) {
    if (duration.w) this.tickers.w.setDuration(duration.w);
    if (duration.b) this.tickers.b.setDuration(duration.b);
  }

  /**
   * Runs when a ticker times out
   */
  private _onTimeout(
    ...args: Parameters<ClientChessClockEventSignatures["onTimeout"]>
  ) {
    this.timedOut = true;
    this.event("onTimeout", ...args);
  }

  /**
   * Runs when a ticker ticks
   */
  private _onTick(
    ...args: Parameters<ClientChessClockEventSignatures["onTick"]>
  ) {
    this.event("onTick", ...args);
  }

  private _onDurationChange(
    ...args: Parameters<ClientChessClockEventSignatures["onDurationChange"]>
  ) {
    this.event("onDurationChange", ...args);
  }
}
