import { cn } from "@/client/lib/utils";
import React from "react";

const RED_THRESHOLD = 50;
const HOT_THRESHOLD = 75;

const clamp = (value: number) => Math.min(Math.max(value, 0), 100);

type WinrateBadgeProps = {
  value: number;
  /**
   * When true, append the label (defaults to "WR") after the percentage.
   */
  showLabel?: boolean;
  /**
   * Optional label text rendered when `showLabel` is true. Defaults to "WR".
   */
  label?: string;
  /**
   * Render the percentage surrounded with parentheses.
   */
  parenthetical?: boolean;
  className?: string;
  labelClassName?: string;
};

export const WinrateBadge = ({
  value,
  showLabel = false,
  label = "WR",
  parenthetical = false,
  className,
  labelClassName,
}: WinrateBadgeProps) => {
  const clamped = clamp(value);
  const isHot = clamped > HOT_THRESHOLD;
  const isRed = clamped > RED_THRESHOLD && !isHot;
  const tone = isHot ? undefined : isRed ? "text-red-400" : undefined;
  const formatted = clamped.toFixed(0);
  const content = parenthetical ? `(${formatted}%)` : `${formatted}%`;
  const valueNode = React.useMemo(() => {
    if (!isHot) {
      return <span className={cn("font-semibold", tone)}>{content}</span>;
    }

    const panelClass = cn(
      "relative inline-flex items-center justify-center overflow-hidden rounded-lg px-2 py-0.5 font-semibold leading-none",
      "text-white shadow-[0_8px_24px_rgba(36,99,255,0.35)]",
      "ring-1 ring-main/40 ring-offset-1 ring-offset-background",
    );

    const gradient = `
linear-gradient(
  90deg,
  var(--color-main) 0%,
  color-mix(in oklch, var(--color-main), white 25%) 30%,
  color-mix(in oklch, var(--color-main), white 55%) 50%,
  color-mix(in oklch, var(--color-main), white 25%) 70%,
  var(--color-main) 100%
)`;

    const panelStyle: React.CSSProperties = {
      backgroundImage: gradient,
      backgroundSize: "280% 100%",
      animation: "wr-hot-wave 4s linear infinite",
    };

    return (
      <span className={panelClass} style={panelStyle}>
        <style>
          {`@keyframes wr-hot-wave {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}`}
        </style>
        <span
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(115% 145% at 10% 20%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 60%)",
          }}
        />
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            mixBlendMode: "screen",
            background:
              "linear-gradient(125deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)",
          }}
        />
        <span
          className="relative z-[1] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] text-white"
          style={{
            textShadow: "0 1px 3px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.35)",
          }}
        >
          {content}
        </span>
      </span>
    );
  }, [content, isHot, tone]);

  if (!Number.isFinite(value)) {
    return <span className={cn("inline-flex text-muted-foreground", className)}>—</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {valueNode}
      {showLabel ? (
        <span className={cn("text-neutral-400 text-tiny", labelClassName)}>{label}</span>
      ) : null}
    </span>
  );
};
