import { useMemo, useState } from "react";
import { useLoaderData, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import * as v from "valibot";
import { toast } from "sonner";
import { InfoIcon, PlusIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";

import { Button } from "@/client/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/client/components/ui/dialog";
import { Badge } from "@/client/components/ui/badge";
import { Separator } from "@/client/components/ui/separator";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { useAppForm } from "@/client/components/form/useAppForm";
import { $adminAddUserPageSummoner } from "@/server/functions/$adminAddUserPageSummoner";
import type { $getUserPageType } from "@/server/functions/$getUserPage";

type PageData = NonNullable<$getUserPageType["page"]>;
type PanelKey = "infos" | "summoners";

const NAV_ITEMS: {
  key: PanelKey;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  {
    key: "infos",
    label: "Infos",
    icon: InfoIcon,
  },
  {
    key: "summoners",
    label: "Linked summoners",
    icon: UsersIcon,
  },
];

const AddSummonerFormSchema = v.object({
  riotId: v.pipe(v.string(), v.minLength(3)),
  type: v.picklist(["MAIN", "SMURF"]),
});

type AddSummonerFormValues = v.InferOutput<typeof AddSummonerFormSchema>;

export function UserPageAdminDialog() {
  const { page } = useLoaderData({ from: "/page/$name" });
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<PanelKey>("infos");

  const router = useRouter();
  const $fn = useServerFn($adminAddUserPageSummoner);

  const addSummoner = useMutation({
    mutationFn: async (data: { riotId: string; type: "MAIN" | "SMURF" }) =>
      $fn({
        data: {
          riotId: data.riotId,
          type: data.type,
          userPageId: page.id,
        },
      }),
    onSuccess: async () => {
      toast.success("Summoner linked to page.");
      form.reset();
      setPanel("summoners");
      await router.invalidate();
    },
    onError: (error) => {
      let message = "Failed to link summoner.";
      if (error instanceof Error && error.message) {
        message = error.message;
      } else if (typeof error === "object" && "message" in error) {
        message = String((error as { message: unknown }).message);
      }
      toast.error(message);
    },
  });

  const form = useAppForm({
    validators: { onChange: AddSummonerFormSchema },
    defaultValues: {
      riotId: "",
      type: "SMURF",
    },
    onSubmit: async ({ value }) => {
      const trimmed = value.riotId.trim();
      if (!trimmed) {
        toast.error("Please enter a Riot ID.");
        return;
      }
      await addSummoner.mutateAsync({
        riotId: trimmed,
        type: value.type as AddSummonerFormValues["type"],
      });
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPanel("infos");
      form.reset();
      addSummoner.reset();
    }
  };

  const orderedSummoners = useMemo(() => {
    const priority: Record<"MAIN" | "SMURF", number> = {
      MAIN: 0,
      SMURF: 1,
    };

    return [...page.summoners].sort((a, b) => {
      const typeDiff = priority[a.type] - priority[b.type];
      if (typeDiff !== 0) return typeDiff;
      return a.summoner.displayRiotId.localeCompare(b.summoner.displayRiotId);
    });
  }, [page.summoners]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Admin tools
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-3/5 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">Page administration</DialogTitle>
          <DialogDescription>Administrative controls for this user page.</DialogDescription>
        </DialogHeader>
        <div className="flex h-[70vh] min-h-[600px]">
          <aside className="w-60 border-r border-border/60 bg-neutral-950/60 px-4 py-6">
            <nav className="flex flex-col gap-1.5">
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                const isActive = panel === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setPanel(key);
                    }}
                    className={[
                      "rounded-md px-3 py-2 text-left transition-colors",
                      "border border-transparent",
                      isActive
                        ? "bg-main/15 border-main/40 text-neutral-50"
                        : "text-neutral-300 hover:bg-neutral-800/40",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>
          <section className="flex-1 overflow-y-auto px-6 py-6">
            {panel === "infos" ? (
              <InfosPanel page={page} />
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-100">
                    <UsersIcon className="h-5 w-5" />
                    Linked summoners
                  </h3>
                  {!orderedSummoners.length ? (
                    <div className="rounded-md border border-dashed border-neutral-800/60 bg-neutral-900/40 px-4 py-8 text-center text-sm text-neutral-400">
                      No summoners linked yet.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {orderedSummoners.map((entry) => (
                        <li
                          key={entry.id}
                          className="rounded-md border border-neutral-800/60 bg-neutral-900/40 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-neutral-100">
                                {entry.summoner.displayRiotId}
                              </p>
                              <p className="text-xs text-neutral-400">
                                PUUID: {entry.summoner.puuid}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <Badge variant="outline" className="gap-1">
                                {entry.type === "MAIN" ? "Main" : "Smurf"}
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                {entry.isPublic ? "Public" : "Private"}
                              </Badge>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-base font-semibold text-neutral-100">
                    <PlusIcon className="h-4 w-4" />
                    Add summoner
                  </h4>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void form.handleSubmit();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px]">
                      <form.AppField
                        name="riotId"
                        children={(field) => (
                          <div className="grid gap-2">
                            <Label htmlFor={field.name}>Riot ID</Label>
                            <Input
                              id={field.name}
                              placeholder="GameName#TAG"
                              value={typeof field.state.value === "string" ? field.state.value : ""}
                              onChange={(e) => {
                                field.handleChange(e.target.value);
                              }}
                            />
                          </div>
                        )}
                      />
                      <form.AppField
                        name="type"
                        children={(field) => (
                          <div className="grid gap-2">
                            <Label htmlFor={`${field.name}-type`}>Type</Label>
                            <Select
                              value={
                                field.state.value === "MAIN" || field.state.value === "SMURF"
                                  ? field.state.value
                                  : "SMURF"
                              }
                              onValueChange={(nextValue: "MAIN" | "SMURF") => {
                                field.handleChange(nextValue);
                              }}
                            >
                              <SelectTrigger id={`${field.name}-type`} className="w-full">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MAIN">Main</SelectItem>
                                <SelectItem value="SMURF">Smurf</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <form.AppForm>
                        <form.SubmitButton label="Link summoner" />
                      </form.AppForm>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfosPanel({ page }: { page: PageData }) {
  const createdAt = page.createdAt instanceof Date ? page.createdAt : new Date(page.createdAt);
  const createdLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(createdAt);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-100">
          <ShieldCheckIcon className="h-5 w-5" />
          Page details
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow label="Page ID" value={page.id} />
          <InfoRow label="User ID" value={page.userId ?? "—"} />
          <InfoRow label="Normalized name" value={page.normalizedName} />
          <InfoRow label="Visibility" value={page.isPublic ? "Public" : "Private"} />
          <InfoRow label="Type" value={page.type} />
          <InfoRow label="Created at" value={createdLabel} />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
          Additional information
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow label="Display name" value={page.displayName} />
          <InfoRow label="Linked summoners" value={String(page.summoners.length)} />
          <InfoRow label="X username" value={page.xUsername ?? "—"} />
          <InfoRow label="Twitch username" value={page.twitchUsername ?? "—"} />
        </div>
        <InfoRow label="Description" value={page.description ?? "—"} />
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-neutral-800/60 bg-neutral-900/30 p-3">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</span>
      <span className="text-sm text-neutral-100">{value}</span>
    </div>
  );
}
