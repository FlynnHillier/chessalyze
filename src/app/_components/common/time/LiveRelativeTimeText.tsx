"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useInterval } from "usehooks-ts";

type Unit = "hour" | "second" | "minute" | "day";

type Schedule = {
  messages: string[];
  interval: {
    first: number;
    typical: number;
  };
};

/**
 * Generate data for upcoming time changes
 *
 * @param ms time since / until target. (since - negative, until - positive)
 * @returns
 */
function generateSchedule(ms: number): Schedule {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const timeToMS = [
    { unit: "second", ms: 1000 },
    { unit: "minute", ms: 60000 },
    { unit: "hour", ms: 3600000 },
    { unit: "day", ms: 86400000 },
  ] as const satisfies { unit: Unit; ms: number }[];

  let i = 0;
  while (i < timeToMS.length - 1 && timeToMS[i + 1].ms <= Math.abs(ms)) i++;

  const target = timeToMS[i];

  // How many x is in y (e.g how many minutes in hour)
  const count =
    i < timeToMS.length - 1 ? timeToMS[i + 1].ms / timeToMS[i].ms : 1;
  //Which second we are currently on e.g (56)
  const current = Math.round(ms / target.ms);
  // How many entries should be in our output (if 56, should either be 4 or 56)
  const cycles = current > 0 ? current : count - Math.abs(current);
  // How long to wait for the first period
  const first_period =
    ms > 0 ? Math.abs(ms) % target.ms : target.ms - (Math.abs(ms) % target.ms);

  const messages: string[] = [];
  for (let c = 0; c < cycles; c++) {
    messages.push(rtf.format(current - c, target.unit));
  }

  return {
    interval: {
      first: first_period,
      typical: target.ms,
    },
    messages: messages,
  };
}

/**
 * Show a live(updated) time, relative to now.
 *
 * @param \{timestamp} the timestamp to calculate a relative time string from
 */
export default function LiveRelativeTime({ timestamp }: { timestamp: number }) {
  const [index, setIndex] = useState<number>(0);
  const [upcoming, setUpcoming] = useState<Schedule>(
    generateSchedule(timestamp - Date.now()),
  );
  const [interval, setInterval] = useState<number | null>(null);

  const newUpcoming = useCallback(() => {
    setUpcoming(generateSchedule(timestamp - Date.now()));
    setIndex(0);
  }, []);

  useInterval(() => {
    if (index >= upcoming.messages.length - 1) return newUpcoming();
    setIndex((i) => i + 1);
  }, interval);

  useEffect(() => {
    if (index > 0) setInterval(upcoming.interval.typical);
    else setInterval(upcoming.interval.typical);
  }, [index, upcoming]);

  return <>{upcoming.messages[index]}</>;
}
