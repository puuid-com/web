import { cn } from "@/client/lib/utils";
import { Check, X, Loader2, Gamepad2, LayoutList, TagIcon } from "lucide-react";

export type Status = "neutral" | "valid" | "invalid" | "pending";

export type ChecklistItem = {
  id: string;
  label: string;
  hint?: string;
  status?: Status;
  icon?: "game" | "format" | "tag";
};

type Props = {
  items: ChecklistItem[];
  className?: string;
};

/**
 * Minimal, inline checklist (no card wrapper).
 * Color and icon shift based on status.
 */
export default function ChecklistInline({ items, className }: Props) {
  return (
    <ul className={cn("mt-2 flex flex-col gap-2", className)}>
      {items.map((it) => {
        const { text } = stylesFor(it.status ?? "neutral");
        return (
          <li key={it.id} className="flex items-center gap-2 text-sm">
            <span
              className={cn("inline-flex h-5 w-5 items-center justify-center")}
            >
              {statusIcon(it.status ?? "neutral")}
            </span>
            <span className="text-emerald-500">{iconFor(it.icon)}</span>
            <span className={cn("transition-colors", text)}>{it.label}</span>
            {it.hint && (
              <span className="ml-2 text-xs text-neutral-500">{it.hint}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function statusIcon(s: Status) {
  switch (s) {
    case "valid":
      return <Check className="h-4 w-4 text-emerald-400" />;
    case "invalid":
      return <X className="h-4 w-4 text-red-400" />;
    case "pending":
      return <Loader2 className="h-4 w-4 animate-spin text-amber-300" />;
    default:
      return <span className="h-2 w-2 rounded-full bg-neutral-600" />;
  }
}

function iconFor(kind?: "game" | "format" | "tag") {
  switch (kind) {
    case "game":
      return <Gamepad2 className="h-4 w-4" />;
    case "format":
      return <LayoutList className="h-4 w-4" />;
    case "tag":
      return <TagIcon className="h-4 w-4" />;
    default:
      return null;
  }
}

function stylesFor(s: Status) {
  switch (s) {
    case "valid":
      return { text: "text-emerald-600", icon: "text-emerald-400" };
    case "invalid":
      return { text: "text-red-500", icon: "text-red-400" };
    case "pending":
      return { text: "text-neutral-300", icon: "text-amber-300" };
    default:
      return { text: "text-neutral-400", icon: "text-neutral-500" };
  }
}
