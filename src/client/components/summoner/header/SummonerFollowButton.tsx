import { Button } from "@/client/components/ui/button";
import { $follow } from "@/server/functions/$follow";
import { $getIsFollowing } from "@/server/functions/$getIsFollowing";
import { $unfollow } from "@/server/functions/$unfollow";
import { debounce } from "@tanstack/pacer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLoaderData, useRouteContext } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { UserRoundMinusIcon, UserRoundPlusIcon } from "lucide-react";
import { toast } from "sonner";

type Props = {};

export const SummonerFollowButton = ({}: Props) => {
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const { user } = useRouteContext({ from: "__root__" });
  const $m_follow = useServerFn($follow);
  const $m_unfollow = useServerFn($unfollow);
  const $q_fn = useServerFn($getIsFollowing);

  const m = useMutation({
    mutationFn: () => {
      return data
        ? $m_unfollow({ data: { puuid: summoner.puuid } })
        : $m_follow({ data: { puuid: summoner.puuid } });
    },
    onSuccess: async () => {
      toast.success("Summoner followed");
      await refetch();
    },
  });

  const debouncedSearch = debounce(
    () => {
      m.mutate();
    },
    {
      wait: 500,
    },
  );

  const { data, refetch } = useQuery({
    queryKey: ["is-following", summoner.puuid],
    queryFn: () => $q_fn({ data: { puuid: summoner.puuid } }),
    enabled: !!user,
  });

  if (!user || data === undefined) {
    return null;
  }

  return (
    <Button variant={"main"} size={"sm"} onClick={debouncedSearch}>
      {data ? <UserRoundMinusIcon /> : <UserRoundPlusIcon />}
      {data ? "Unfollow" : "Follow"}
    </Button>
  );
};
