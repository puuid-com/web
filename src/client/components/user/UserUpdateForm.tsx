import { useRouteContext } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import * as v from "valibot";
import { useAppForm } from "@/client/components/form/useAppForm";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { Separator } from "@/client/components/ui/separator";
import { useStore } from "@tanstack/react-form";
import { UserProfileIconsDialog } from "@/client/components/user/profile-icons/UserProfileIconsDialog";
import { CameraIcon } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import { Switch } from "@/client/components/ui/switch";
import { Label } from "@/client/components/ui/label";
import { useServerFn } from "@tanstack/react-start";
import { $postUserPage } from "@/server/functions/$postUserPage";

export const UserPageUpdateFormSchema = v.object({
  displayName: v.pipe(v.string()),
  description: v.string(),
  xUsername: v.string(),
  twitchUsername: v.string(),
  isPublic: v.boolean(),
  profileImage: v.pipe(v.string(), v.url()),
});

type Props = {};

export function UserUpdateForm({}: Props) {
  const { userPage, user } = useRouteContext({ from: "/user" });
  const $fn = useServerFn($postUserPage);

  const $m = useMutation({
    mutationKey: ["update-user", user.id],
    mutationFn: async (data: v.InferOutput<typeof UserPageUpdateFormSchema>) =>
      $fn({
        data,
      }),
  });

  const form = useAppForm({
    validators: { onChange: UserPageUpdateFormSchema },
    defaultValues: {
      displayName: userPage.displayName,
      description: userPage.description ?? "",
      xUsername: userPage.xUsername ?? "",
      twitchUsername: userPage.twitchUsername ?? "",
      isPublic: userPage.isPublic,
      profileImage: userPage.profileImage,
    },
    onSubmit: async ({ value }) => {
      await $m.mutateAsync(value);
      toast.success("User updated");
      window.location.reload();
    },
  });

  const userName = useStore(form.store, (state) => state.values.displayName);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-card-foreground">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <form.Field
            name="profileImage"
            children={(field) => (
              <>
                <UserProfileIconsDialog
                  onChange={(url) => {
                    field.handleChange(url);
                  }}
                >
                  <div className={"relative"}>
                    <img className="w-20 h-20 rounded-md" src={field.state.value} alt="" />
                    <Button
                      className={
                        "absolute px-0 bottom-0 right-0 rounded-md translate-x-1/2 translate-y-1/2 border-neutral-900 border-4"
                      }
                      variant={"secondary"}
                    >
                      <CameraIcon size={16} />
                    </Button>
                  </div>
                </UserProfileIconsDialog>
              </>
            )}
          />

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-card-foreground">{userName}</h2>
            <p className="text-sm text-muted-foreground">Member since Aug 2025</p>
          </div>
        </div>

        <Separator />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.AppField
            name="displayName"
            children={(field) => <field.TextField label="Name" />}
          />
          <form.AppField
            name="description"
            children={(field) => (
              <field.TextareaField label="Description" placeholder="Tell people about yourself" />
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.AppField
              name="xUsername"
              children={(field) => <field.TextField label="X username" />}
            />
            <form.AppField
              name="twitchUsername"
              children={(field) => <field.TextField label="Twitch username" />}
            />
          </div>
          <form.Field
            name="isPublic"
            children={(field) => (
              <div className="flex items-center gap-2">
                <Switch
                  id="public-toggle"
                  checked={field.state.value}
                  onCheckedChange={(checked) => {
                    field.handleChange(checked);
                  }}
                />
                <Label htmlFor="public-toggle" className="cursor-pointer">
                  Public profile
                </Label>
              </div>
            )}
          />
          <form.AppForm>
            <form.SubmitButton label="Submit" />
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
