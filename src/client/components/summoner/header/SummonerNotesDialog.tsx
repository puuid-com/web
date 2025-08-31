import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NotebookPen, Loader2 } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/client/components/ui/dialog";
import { useLoaderData } from "@tanstack/react-router";
import * as v from "valibot";
import { useAppForm } from "@/client/components/form/useAppForm";
import { toast } from "sonner";
import { $getSummonerNotes } from "@/server/functions/$getSummonerNotes";
import { $upsertSummonerNotes } from "@/server/functions/$upsertSummonerNotes";
import { useServerFn } from "@tanstack/react-start";

type Props = {};

const validationSchema = v.object({
  notes: v.string(),
});

export function SummonerNotesDialog({}: Props) {
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const summonerName = summoner.displayRiotId;

  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const _$getSummonerNotes = useServerFn($getSummonerNotes);
  const _$upsertSummonerNotes = useServerFn($upsertSummonerNotes);

  const { data: initialNotes = "", isLoading } = useQuery({
    queryKey: ["summoner-notes", summonerName, summoner.puuid],
    queryFn: () => _$getSummonerNotes({ data: { puuid: summoner.puuid } }),
  });

  const q_updateNotes = useMutation({
    mutationFn: (notes: string) =>
      _$upsertSummonerNotes({ data: { puuid: summoner.puuid, notes } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["summoner-notes", summonerName] });
      setIsOpen(false);
    },
  });

  const form = useAppForm({
    validators: { onChange: validationSchema },
    defaultValues: {
      notes: initialNotes,
    },
    onSubmit: async ({ value }) => {
      await q_updateNotes.mutateAsync(value.notes);
      toast.success("User updated");
    },
  });

  // Reset form when dialog opens and data is loaded
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && initialNotes) {
      form.setFieldValue("notes", initialNotes);
    }
  };

  const handleCancel = () => {
    form.setFieldValue("notes", initialNotes);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <NotebookPen className="h-4 w-4" />
          {initialNotes ? "Edit Notes" : "Add Notes"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NotebookPen className="h-5 w-5" />
            Notes for {summonerName}
          </DialogTitle>
          <DialogDescription>
            Add your personal notes about this summoner. Track their playstyle, champion
            preferences, or any other observations.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading notes...</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit();
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <form.AppField
                  name="notes"
                  children={(field) => (
                    <field.TextareaField
                      label="Notes"
                      placeholder={"Enter your notes about this summoner..."}
                    />
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <form.AppForm>
                <form.SubmitButton label="Submit" />
              </form.AppForm>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
