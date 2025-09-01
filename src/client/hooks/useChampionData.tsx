import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";

export const useGetChampionData = (championId: number | undefined, enabled?: boolean) => {
  const metadata = useLoaderData({ from: "/lol" });

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["champion", metadata.champions, metadata.latest_version, championId!],
    queryFn: async () => {
      const data = await DDragonService.getChampionData(
        metadata.champions,
        metadata.latest_version,
        championId!,
      );

      return data.data[metadata.champions[championId!]!.name];
    },
    enabled: !!championId && enabled !== false,
  });
};
