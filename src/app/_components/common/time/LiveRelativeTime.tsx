"use client";

import { useCallback, useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";

type TimeUnit = Exclude<Intl.RelativeTimeFormatUnitSingular, "quarter">;

const TIMES = {
  second: 1000,
  minute: 60000,
  hour: 3600000,
  day: 86400000,
  week: 604800000,
  month: 2629746000,
  year: 31556952000,
} as const satisfies Record<TimeUnit, number>;

export default function LiveRelativeTime({ timestamp }: { timestamp: number }) {
  const [interval, setInterval] = useState<number | null>(null);
  const [message, setMessage] = useState<String>();

  const refreshTime = useCallback(() => {
    const DIFF = timestamp - Date.now();
    const ABS_DIFF = Math.abs(DIFF);

    const UNIT: TimeUnit =
      ABS_DIFF >= TIMES.year
        ? "year"
        : ABS_DIFF >= TIMES.month
          ? "month"
          : ABS_DIFF >= TIMES.week
            ? "week"
            : ABS_DIFF >= TIMES.day
              ? "day"
              : ABS_DIFF >= TIMES.hour
                ? "hour"
                : ABS_DIFF >= TIMES.minute
                  ? "minute"
                  : "second";

    setInterval(
      DIFF < 0
        ? TIMES[UNIT] - (ABS_DIFF % TIMES[UNIT])
        : ABS_DIFF % TIMES[UNIT],
    );

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    setMessage(
      rtf.format(
        DIFF > 0
          ? Math.floor(DIFF / TIMES[UNIT])
          : Math.ceil(DIFF / TIMES[UNIT]),
        UNIT,
      ),
    );
  }, [timestamp]);

  useEffect(() => {
    refreshTime();

    return () => {
      setInterval(null);
    };
  }, []);

  useInterval(() => {
    refreshTime();
  }, interval);

  return <>{message}</>;
}
