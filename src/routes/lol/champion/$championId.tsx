import { createFileRoute } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/client/components/ui/table";
import { $getChampionStats } from "@/server/functions/$getChampionStats";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/champion/$championId")({
  component: RouteComponent,
  params: {
    parse: (raw) => ({ championId: Number(raw.championId) }),
    stringify: (p) => ({ championId: String(p.championId) }),
  },
  loader: async (ctx) => {
    const data = await $getChampionStats({ data: { championId: ctx.params.championId } });
    return data;
  },
});

function RouteComponent() {
  const { stats } = Route.useLoaderData();
  const { championId } = Route.useParams();
  const { champions, latest_version } = useLoaderData({ from: "/lol" });
  const champ = champions[championId];

  return (
    <div className="container mx-auto flex flex-col gap-6 p-5">
      <div className="flex items-center gap-4">
        {champ && (
          <img
            src={DDragonService.getChampionIconUrl(latest_version, champ.image.full)}
            alt={champ.name}
            className="w-16 h-16 rounded"
          />
        )}
        <h1 className="text-3xl font-bold">{champ?.name ?? `Champion ${championId}`}</h1>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            <TableHead>Games</TableHead>
            <TableHead>Wins</TableHead>
            <TableHead>Losses</TableHead>
            <TableHead>Win Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((s) => (
            <TableRow key={s.position ?? "unknown"}>
              <TableCell>{s.position || "UNKNOWN"}</TableCell>
              <TableCell>{s.games}</TableCell>
              <TableCell>{s.wins}</TableCell>
              <TableCell>{s.losses}</TableCell>
              <TableCell>{(s.winRate * 100).toFixed(2)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
