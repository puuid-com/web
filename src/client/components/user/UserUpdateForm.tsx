import { useRouteContext } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import * as v from "valibot";
import { useAppForm } from "@/client/components/form/useAppForm";
import { toast } from "sonner";
import { Separator } from "@/client/components/ui/separator";
import { useStore } from "@tanstack/react-form";
import { UserProfileIconsDialog } from "@/client/components/user/profile-icons/UserProfileIconsDialog";
import { CameraIcon } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import { Switch } from "@/client/components/ui/switch";
import { Label } from "@/client/components/ui/label";
import { useServerFn } from "@tanstack/react-start";
import { $postUserPage } from "@/server/functions/$postUserPage";
import { Input } from "@/client/components/ui/input";
import { SiTwitch, SiX } from "@icons-pack/react-simple-icons";
import { Textarea } from "@/client/components/ui/textarea";

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
  const memberSince = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(userPage.createdAt);

  return (
    <div className="space-y-6">
      {/* Header: Avatar + Name + Visibility */}
      <div className="grid grid-cols-1 md:grid-cols-[96px_1fr] items-start gap-6">
        <div className="flex flex-col items-center md:items-start gap-3">
          <form.Field
            name="profileImage"
            children={(field) => (
              <UserProfileIconsDialog
                onChange={(url) => {
                  field.handleChange(url);
                }}
              >
                <div className="relative group">
                  <img
                    className="w-24 h-24 rounded-md object-cover ring-1 ring-border/60"
                    src={field.state.value}
                    alt={`${userName}'s profile image`}
                  />
                  <Button
                    className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 rounded-full px-0 ring-1 ring-border"
                    variant="secondary"
                    size="xs"
                  >
                    <CameraIcon size={14} />
                    <span className="sr-only">Change avatar</span>
                  </Button>
                </div>
              </UserProfileIconsDialog>
            )}
          />
        </div>

        {/* Right: Header + form fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-5 min-w-0"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-card-foreground leading-tight truncate">
                {userName}
              </h2>
              <p className="text-xs text-muted-foreground">Member since {memberSince}</p>
            </div>
            <form.Field
              name="isPublic"
              children={(field) => (
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    id="public-toggle"
                    checked={field.state.value}
                    onCheckedChange={(checked) => {
                      field.handleChange(checked);
                    }}
                  />
                  <Label htmlFor="public-toggle" className="cursor-pointer text-sm">
                    Public profile
                  </Label>
                </div>
              )}
            />
          </div>

          <Separator />
          <form.AppField
            name="displayName"
            children={(f) => (
              <div className="grid w-full items-center gap-2">
                <Label htmlFor={f.name}>Name</Label>
                <Input
                  id={f.name}
                  value={f.state.value}
                  onChange={(e) => {
                    f.handleChange(e.target.value);
                  }}
                />
              </div>
            )}
          />

          <form.AppField
            name="description"
            children={(f) => (
              <div className="grid w-full items-center gap-2">
                <Label htmlFor={f.name}>Bio</Label>
                <Textarea
                  id={f.name}
                  className="min-h-[120px] resize-none"
                  value={f.state.value}
                  onChange={(e) => {
                    f.handleChange(e.target.value);
                  }}
                  onBlur={f.handleBlur}
                  maxLength={500}
                  placeholder="Tell people about yourself"
                />
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.AppField
              name="xUsername"
              children={(f) => (
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor={f.name}>X username</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <SiX className="size-4" />
                    </div>
                    <Input
                      id={f.name}
                      className="pl-9"
                      value={f.state.value}
                      onChange={(e) => {
                        f.handleChange(e.target.value);
                      }}
                    />
                  </div>
                </div>
              )}
            />

            <form.AppField
              name="twitchUsername"
              children={(f) => (
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor={f.name}>Twitch username</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <SiTwitch className="size-4" />
                    </div>
                    <Input
                      id={f.name}
                      className="pl-9"
                      value={f.state.value}
                      onChange={(e) => {
                        f.handleChange(e.target.value);
                      }}
                    />
                  </div>
                </div>
              )}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <form.AppForm>
              <form.SubmitButton label="Save changes" />
            </form.AppForm>
          </div>
        </form>
      </div>
    </div>
  );
}
