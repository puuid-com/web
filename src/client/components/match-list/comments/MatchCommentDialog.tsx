import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotebookPen } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/client/components/ui/dialog";
import { useRouteContext } from "@tanstack/react-router";
import * as v from "valibot";
import { useAppForm } from "@/client/components/form/useAppForm";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { $postMatchComment } from "@/server/functions/$postMatchComment";
import { useMatchContext } from "@/client/context/MatchContext";
import { getMatchCommentsKey } from "@/client/hooks/useMatchComments";
import Mentions from "rc-mentions";
import { useStore } from "@tanstack/react-form";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";

type Props = {};

const validationSchema = v.object({
  text: v.string(),
});

export function MatchCommentDialog({}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { match, matchSummoner } = useMatchContext();
  const { user } = useRouteContext({ from: "__root__" });

  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const $fn = useServerFn($postMatchComment);

  const m = useMutation({
    mutationFn: (text: string) =>
      $fn({
        data: {
          matchId: match.matchId,
          puuid: matchSummoner.puuid,
          text,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getMatchCommentsKey(match.matchId) });
      setIsOpen(false);
    },
  });

  const form = useAppForm({
    validators: { onChange: validationSchema },
    defaultValues: { text: "" },
    onSubmit: async ({ value }) => {
      await m.mutateAsync(value.text);
      toast.success("Comment added");
    },
  });

  const mentionCandidates = useMemo(() => {
    return match.summoners
      .map((s) => {
        const display = `${s.gameName}#${s.tagLine}`;
        return { id: s.puuid, display, profileIconId: s.profileIconId };
      })
      .filter(
        (v, i, arr) =>
          arr.findIndex((x) => x.display.toLowerCase() === v.display.toLowerCase()) === i,
      );
  }, [match.summoners]);

  const textValue = useStore(form.store, (s) => s.values.text);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      form.setFieldValue("text", "");
    }
  };

  const handleCancel = () => {
    form.setFieldValue("text", "");
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="main" size="sm" className="relative inline-flex items-center">
          <NotebookPen className="h-4 w-4" />
          {"Add Comment"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NotebookPen className="h-5 w-5" />
            Add a comment
          </DialogTitle>
          <DialogDescription>Type @ to mention a player</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Notes</label>

              <div className={"bg-white"} ref={ref}>
                <Mentions
                  value={textValue}
                  onChange={(val) => {
                    form.setFieldValue("text", val);
                  }}
                  autoSize
                  prefix="@"
                  placeholder="Enter your comment, type @ to mention a player"
                  className="w-full text-sm"
                  style={{ background: "transparent", padding: "10px 12px", lineHeight: "1.5" }}
                  dropdownClassName="z-[1000] bg-orange-300/10"
                  getPopupContainer={() => ref.current!}
                  notFoundContent="No matches"
                  // show menu even when nothing typed after @
                  validateSearch={() => true}
                  // optional, see that search triggers
                  onSearch={(text) => {
                    console.log("search", text);
                  }}
                  // simple contains filter
                  filterOption={(input, option) =>
                    option.value?.toLowerCase().includes((input || "").toLowerCase()) ?? false
                  }
                >
                  {mentionCandidates.map((u) => (
                    <Mentions.Option className={"text-black"} key={u.id} value={u.display}>
                      <div className="flex flex-row gap-1.5 text-sm hover:bg-foreground/5 cursor-pointer rounded-lg">
                        <div>
                          <img
                            src={CDragonService.getProfileIcon(u.profileIconId)}
                            alt=""
                            className={"w-6"}
                          />
                        </div>
                        {u.display}
                      </div>
                    </Mentions.Option>
                  ))}
                </Mentions>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2.5">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <form.AppForm>
                <form.SubmitButton label="Submit" />
              </form.AppForm>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
