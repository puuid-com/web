import { Select, SelectContent, SelectItem, SelectTrigger } from "@/client/components/ui/select";
import { useMainChampionContext } from "@/client/context/MainChampionContext";
import { FriendlyQueueTypes, type FriendlyQueueType } from "@/client/lib/typeHelper";
import { cn, upperCaseFirstChar } from "@/client/lib/utils";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";

export const SummonerQueueSelect = () => {
  const q = useSearch({ from: "/lol/summoner/$riotID", select: (s) => s.q });
  const params = useParams({ from: "/lol/summoner/$riotID" });
  const navigate = useNavigate({ from: "/lol/summoner/$riotID" });
  const { backgroundColor, foregroundColor } = useMainChampionContext();

  const handleChange = (value: FriendlyQueueType) => {
    console.log({ value });
    navigate({
      to: ".",
      params,
      search: (s) => ({
        ...s,
        q: value,
      }),
    }).catch(console.error);
  };

  return (
    <Select value={q} onValueChange={handleChange}>
      <SelectTrigger
        className={cn(
          "h-8 w-[120px] dark:hover:bg-main/30 text-main dark:bg-main/10 ring-1",
          "focus-visible:ring-main/50 ",
          "ring-main/30 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)]",
        )}
      >
        <div className="flex items-center gap-2">
          <span>{upperCaseFirstChar(q)}</span>
        </div>
      </SelectTrigger>
      <SelectContent
        className={"dark:bg-main/50"}
        style={
          {
            "--color-main": backgroundColor ?? undefined,
            "--color-main-foreground": foregroundColor ?? undefined,
          } as React.CSSProperties
        }
      >
        {FriendlyQueueTypes.map((queue) => (
          <SelectItem
            key={queue}
            value={queue}
            className={"dark:bg-inherit dark:hover:bg-main/30 flex items-center gap-2"}
          >
            <span>{upperCaseFirstChar(queue)}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
