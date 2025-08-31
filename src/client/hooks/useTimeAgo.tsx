import React from "react";

type Unit = "year" | "month" | "week" | "day" | "hour" | "minute" | "second";

const DIVS: [Unit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

function diffToUnit(seconds: number): { value: number; unit: Unit } {
  for (const [unit, sec] of DIVS) {
    const v = Math.floor(seconds / sec);
    if (Math.abs(v) >= 1) return { value: v, unit };
  }
  return { value: 0, unit: "second" };
}

export function useTimeAgo(
  date?: Date | number | string | null,
  locale: string = typeof navigator !== "undefined" ? navigator.language : "en",
): string | null {
  const target = React.useMemo(() => {
    if (date == null) return NaN;
    const t = date instanceof Date ? date.getTime() : new Date(date).getTime();
    return t;
  }, [date]);

  const [now, setNow] = React.useState(() => Date.now());

  const invalid = !Number.isFinite(target);

  React.useEffect(() => {
    if (invalid) return;

    let id: number | null = null;
    const tick = () => {
      setNow(Date.now());
    };
    const start = () => {
      id ??= window.setInterval(tick, 1000);
    };
    const stop = () => {
      if (id != null) window.clearInterval(id);
      id = null;
    };

    const onVis = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        stop();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [invalid]);

  const rtf = React.useMemo(
    () => (invalid ? null : new Intl.RelativeTimeFormat(locale, { numeric: "auto" })),
    [invalid, locale],
  );

  if (invalid) return null;

  const seconds = Math.round((target - now) / 1000);
  const { value, unit } = diffToUnit(seconds);

  return rtf?.format(value, unit) ?? null;
}
