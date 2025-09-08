import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";

export const useGetChampionData = (championId: number | undefined, enabled?: boolean) => {
  const metadata = useLoaderData({ from: "/lol" });

  const id = DDragonService.getChampionStringId(metadata.champions, championId!);

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["champion", metadata.latest_version, id],
    queryFn: async () => {
      const data = await DDragonService.getChampionData(metadata.latest_version, id);

      return data.data[id]!;
    },
    enabled: !!championId && enabled !== false,
    retry: false,
  });
};
