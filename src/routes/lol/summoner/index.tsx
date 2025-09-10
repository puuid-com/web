import { SummonerList } from "@/client/components/summoner-list/SummonerList";
import { $getSummoners } from "@/server/functions/$getSummoners";
import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/client/components/ui/input";
import * as v from "valibot";
import React, { type ChangeEvent } from "react";
import { debounce } from "@tanstack/react-pacer";

export const Route = createFileRoute("/lol/summoner/")({
  component: RouteComponent,
  validateSearch: (raw) =>
    v.parse(
      v.object({
        c: v.exactOptional(v.string()),
      }),
      raw,
    ),
  loader: async () => await $getSummoners(),
});

function RouteComponent() {
  const c = Route.useSearch({ select: (s) => s.c });
  const navigate = Route.useNavigate();
  const summoners = Route.useLoaderData();

  const [value, setValue] = React.useState(c ?? "");

  const handleMainFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;

    setValue(value);
    debouncedSearch(value);
  };

  const debouncedSearch = debounce(
    (c: string) => {
      navigate({
        to: ".",
        search: {
          c: c || undefined,
        },
      }).catch(console.error);
    },
    {
      wait: 500,
    },
  );

  return (
    <div className={"flex container mx-auto flex-col gap-5 items-center justify-center"}>
      <div className={"flex p-5 flex-col gap-5 items-center justify-center"}>
        <h1 className={"text-3xl font-bold"}>Search Summoners</h1>
        <div>
          <Input
            type="text"
            placeholder="Search for a summoner..."
            className="input input-bordered w-96"
            onChange={handleMainFilterChange}
            value={value}
          />
        </div>
      </div>
      <SummonerList summoners={summoners} />
    </div>
  );
}
