import ChecklistInline, { type Status } from "@/client/components/riot-id-form/helpers";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { cn } from "@/client/lib/utils";
import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import * as v from "valibot";

type Props = { onSuccess: (riotId: string) => void };

const HAS_FORMAT =
  /^[\p{Zs}]*(?:[\p{L}\p{N}][\p{L}\p{N}\p{Zs}]*)+[\p{Zs}]*#[\p{Zs}]*(?:[\p{L}\p{N}][\p{L}\p{N}\p{Zs}]*)+[\p{Zs}]*$/u;
const GAME_OK = /^\s*(?:[\p{L}\p{N}][\p{Zs}]*){3,16}#/u;
const TAG_OK = /#(?:[\p{Zs}]*[\p{L}\p{N}]){3,5}[\p{Zs}]*$/u;
const NAME_CHARS = /^[\p{L}\p{N}\p{Zs}]*$/u;
const TAG_CHARS = /^[\p{L}\p{N}\p{Zs}]*$/u;

const validationSchema = v.object({
  riotId: v.pipe(
    v.string(),
    v.regex(HAS_FORMAT, "RiotIdForm-#_CHECK"),
    v.regex(GAME_OK, "RiotIdForm-GAME_NAME"),
    v.regex(TAG_OK, "RiotIdForm-TAG_LINE"),
  ),
});

export function RiotIdForm({ onSuccess }: Props) {
  const form = useForm({
    defaultValues: { riotId: "" },
    validators: { onChange: validationSchema },
    onSubmit: ({ value }) => {
      onSuccess(value.riotId);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        form.handleSubmit();
      }}
      className="flex items-start gap-3 w-90"
    >
      <div className="w-full max-w-md">
        <form.Field
          name="riotId"
          children={(field) => (
            <div className="relative group">
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                }}
                placeholder="GameName#TagLine"
                className="bg-neutral-900 border-neutral-800 text-neutral-200 placeholder:text-neutral-500"
                aria-describedby={`${field.name}-checks`}
              />

              {/* Popup under the input, visible only on focus */}
              <div
                id={`${field.name}-checks`}
                className={cn(
                  "absolute left-0 right-0 top-full z-20 mt-2",
                  "pointer-events-none opacity-0 translate-y-1",
                  "group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0",
                  "transition-[opacity,transform] duration-150",
                )}
                aria-live="polite"
              >
                <div className="rounded-md border border-neutral-800 bg-neutral-900/95 backdrop-blur p-3 shadow-xl">
                  <Checks field={field} />
                </div>
              </div>
            </div>
          )}
        />
      </div>

      <form.Subscribe
        selector={(s) => [s.canSubmit, s.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting ? "..." : "Submit"}
          </Button>
        )}
      />
    </form>
  );
}

function Checks({ field, className }: { field: AnyFieldApi; className?: string }) {
  const value = String(field.state.value ?? "");
  const statuses = computeStatuses(value);

  return (
    <div className={cn("text-sm", className)}>
      <ChecklistInline
        items={[
          {
            id: "game",
            label: "Game Name",
            hint: "min 3, max 16",
            status: statuses.game,
            icon: "game",
          },
          {
            id: "format",
            label: "Format",
            hint: undefined,
            status: statuses.format,
            icon: "format",
          },
          {
            id: "tag",
            label: "Tag Line",
            hint: "min 3, max 5",
            status: statuses.tag,
            icon: "tag",
          },
        ]}
      />
    </div>
  );
}

function computeStatuses(riotId: string): {
  game: Status;
  tag: Status;
  format: Status;
} {
  if (!riotId) {
    return { game: "neutral", tag: "neutral", format: "neutral" };
  }

  const [namePart = "", tagPart = ""] = riotId.split("#", 2);

  let game: Status = "neutral";
  if (namePart.length > 0) {
    if (!NAME_CHARS.test(namePart)) game = "invalid";
    else if (namePart.length < 3) game = "pending";
    else if (namePart.length > 16) game = "invalid";
    else game = "valid";
  }

  let tag: Status = "neutral";
  if (riotId.includes("#")) {
    if (!TAG_CHARS.test(tagPart)) tag = "invalid";
    else if (tagPart.length === 0) tag = "pending";
    else if (tagPart.length < 3) tag = "pending";
    else if (tagPart.length > 5) tag = "invalid";
    else tag = "valid";
  }

  const format: Status = HAS_FORMAT.test(riotId)
    ? "valid"
    : riotId.includes("#")
      ? "pending"
      : "pending";

  return { game, tag, format };
}
