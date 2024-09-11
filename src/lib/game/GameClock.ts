import { Color } from "chess.js";
import { BW } from "~/types/game.types";

class Ticker {
  private active; //if is active
  private ended; //if the clock has ran its duration or not
  private hasStarted = false; // if the clock has been started yet (true after first call of start method)
  private duration: number = 0; //the duration the clock should run for

  private accumulatedElapse: number = 0; //total time elapsed not including current start/pause cycle
  private lastStartEpoch: number = 0; //time since start method was called; in epoch format
  private timeout: NodeJS.Timeout | null = null; //timeout to fire on game timeout

  /**
   * @param duration - the length of time the ticker will run for before ending (ms)
   * @param onTimeOut - will fire when the ticker times out
   * @param interval - the interval in which the ticker will tick (ms)
   */
  constructor(
    duration: number,
    private onTimeOut: (...args: any[]) => any,
  ) {
    this.active = false;
    this.ended = false;

    this.setRemainingDuration(duration);
  }

  /**
   * @description - start the clock
   */
  public start() {
    if (!this.active) {
      this.timeout = setTimeout(
        this.end.bind(this),
        this.getRemainingDuration(),
      );
      this.active = true;
      this.lastStartEpoch = new Date().getTime();
      this.hasStarted = true;
    }
  }

  /**
   * @description - pause the clock
   */
  public pause() {
    if (this.active) {
      this.active = false;
      if (this.timeout !== null) {
        clearTimeout(this.timeout);
      }
      this.timeout = null;
      this.accumulatedElapse += this.getTimeSinceLastStart();

      //check if game should have ended (Not entirely necessary but will likely prevent obscure error cases in which perhaps the timeout clears very close to 0)
      if (this.ended !== true && this.getRemainingDuration() <= 0) {
        this.end();
      }
    }
  }

  /**
   * ensures timeout is synced to duration
   */
  private updateTimeout() {
    if (!this.isActive() && this.timeout) {
      clearTimeout(this.timeout);
    } else if (this.isActive()) {
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(
        this.end.bind(this),
        this.getRemainingDuration(),
      );
    }
  }

  /**
   * @description - calculate the time remaining on the clock.
   */
  public getRemainingDuration() {
    return this.duration - this.getElapsed();
  }

  /**
   * set remaining duration
   */
  public setRemainingDuration(duration: number) {
    this.duration = duration;
    this.updateTimeout();
  }

  /**
   * @description - query if the clock has ended
   */
  public isEnded() {
    return this.ended;
  }

  /**
   * @description - query if the clock is currently active
   */
  public isActive() {
    return this.active;
  }

  /**
   * @description - end the clock
   */
  private end() {
    this.pause();
    this.ended = true;
    this.onTimeOut();
  }

  /**
   * @description - calculate the time that has elapsed
   */
  private getElapsed(): number {
    if (!this.hasStarted) {
      return 0;
    }
    if (!this.active) {
      return this.accumulatedElapse;
    }

    return this.getTimeSinceLastStart() + this.accumulatedElapse;
  }

  private getTimeSinceLastStart(): number {
    return new Date().getTime() - this.lastStartEpoch;
  }
}

export class ChessClock {
  private active = false;
  private turn: Color = "w";
  private clocks;
  private ended = false;
  private timeOutPerspective: null | Color = null;

  /**
   * @param time - the initial time each clock will have
   * @param onTimeOutCallBack - will fire when either clock runs out
   */
  constructor(
    times: BW<number>,
    private onTimeOutCallBack: (perspective: Color) => any,
  ) {
    this.clocks = {
      w: new Ticker(times.w, () => {
        this.onTickerEnd("w");
      }),
      b: new Ticker(times.b, () => {
        this.onTickerEnd("b");
      }),
    };
  }

  private onTickerEnd(perspective: Color) {
    this.stop();
    this.ended = true;
    this.timeOutPerspective = perspective;
    this.onTimeOutCallBack(perspective);
  }

  /**
   * @description - start the clock.
   */
  public start() {
    if (!this.active) {
      this.active = true;
      this.clocks[this.turn].start();
    }
  }

  /**
   * @description - stop the clock.
   */
  public stop() {
    if (this.active) {
      this.active = false;
      this.clocks[this.turn].pause();
    }
  }

  /**
   * @description - switches the clock to begin timing out the other perspective's clock.
   */

  public switch(turn?: Color) {
    this.clocks[this.turn].pause();

    this.turn = turn ?? this.turn == "w" ? "b" : "w";

    this.clocks[this.turn].start();
  }

  /**
   * @returns - {boolean} if clock is active
   */
  public isActive(): boolean {
    return this.active;
  }

  /**
   * @returns - {false} | {Color} , false if the clock has not yet timed-out; if the clock has timed-out: the colour of who's individual ticker timed out.
   */
  public hasEnded(): false | Color {
    return this.ended === false ? false : (this.timeOutPerspective as Color);
  }

  /**
   * @returns
   */
  public getDurations(): { w: number; b: number } {
    return {
      w: this.clocks.w.getRemainingDuration(),
      b: this.clocks.b.getRemainingDuration(),
    };
  }

  public editDuration(edit: BW<number>): BW<number> {
    if (edit.w) this.clocks.w.setRemainingDuration(edit.w);
    if (edit.b) this.clocks.w.setRemainingDuration(edit.b);

    return this.getDurations();
  }
}
