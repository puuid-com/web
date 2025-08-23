import { DDragonService } from "@/client/services/DDragon";
import type { ChampionResponseType } from "@/client/services/DDragon/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Vibrant } from "node-vibrant/browser";

export const Route = createFileRoute("/colors")({
  component: RouteComponent,
  loader: async () => await DDragonService.loadMetadata(),
  ssr: false,
});

const items = [
  { key: "Vibrant", label: "Vibrant" },
  { key: "LightVibrant", label: "Light Vibrant" },
  { key: "DarkVibrant", label: "Dark Vibrant" },
  { key: "Muted", label: "Muted" },
  { key: "LightMuted", label: "Light Muted" },
  { key: "DarkMuted", label: "Dark Muted" },
];

function Component({
  champion,
  id,
}: {
  champion: ChampionResponseType;
  id: number;
}) {
  const metadata = Route.useLoaderData();
  const url = DDragonService.getChampionLoadingScreenImage(
    metadata.champions,
    id
  );

  const { data, status } = useQuery({
    queryKey: ["champion", id],
    queryFn: () => Vibrant.from(url).getPalette(),
  });

  if (status !== "success") return null;

  return (
    <div key={id} className="flex flex-col bg-purple-500">
      <h2>{champion.name}</h2>

      {/* étire les enfants sur la même hauteur */}
      <div className="flex w-full items-stretch bg-red-500">
        {/* fais occuper toute la hauteur par l’image */}
        <div className="flex">
          <img src={url} alt="" className="h-full w-auto object-cover" />
        </div>

        {/* colonne qui prend le reste de l’espace vertical et horizontal */}
        <ul className="flex flex-1 flex-col list-none m-0 p-0 bg-purple-400">
          {items.map(({ key, label }) => {
            const swatch = (data as any)?.[key];
            return (
              <li
                key={key}
                style={{
                  backgroundColor: swatch?.hex,
                  color: swatch?.bodyTextColor,
                }}
                className="flex flex-1 items-center justify-center"
              >
                {label} <span>{`(${swatch?.hex})`}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function RouteComponent() {
  const metadata = Route.useLoaderData();

  return (
    <div>
      <h1>Champions</h1>
      <div>
        {Object.entries(metadata.champions).map(
          ([championId, championData]) => {
            return (
              <Component
                key={championId}
                champion={championData}
                id={Number(championId)}
              />
            );
          }
        )}
      </div>
    </div>
  );
}
