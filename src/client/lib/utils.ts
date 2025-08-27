import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeago(
  input: Date | string,
  locale: string | string[] = navigator.language,
): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If future date, return the formatted date
  if (diffMs < 0) {
    return new Intl.DateTimeFormat(locale).format(date);
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours <= 1) {
    const value = -diffMinutes;
    const absNumStr = String(Math.abs(value));
    return absNumStr + "m";
  } else if (diffDays <= 1) {
    const value = -diffHours;
    const absNumStr = String(Math.abs(value));
    return absNumStr + "h";
  } else {
    return `${diffDays}d`;
  }
}

export const formatSeconds = (secs: number) => {
  const secInHour = 3600;
  const secInMinute = 60;

  const h = Math.floor(secs / secInHour);
  const m = Math.floor((secs % secInHour) / secInMinute);
  const s = secs % secInMinute;

  const parts = [];

  if (h) parts.push(String(h).padStart(2, "0") + "h");
  if (m) parts.push(String(m).padStart(2, "0") + "m");
  if (s || parts.length === 0) parts.push(String(s).padStart(2, "0") + "s");

  return parts.join(" ");
};

export const hexToRgba = (hex: string | undefined | null, alpha: number) => {
  if (!hex) return undefined;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
