import { useRouteContext, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import * as v from "valibot";
import { useAppForm } from "@/client/components/form/useAppForm";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { Separator } from "@/client/components/ui/separator";
import { useStore } from "@tanstack/react-form";
import { UserProfileIconsDialog } from "@/client/components/user/profile-icons/UserProfileIconsDialog";
import { CameraIcon } from "lucide-react";
import { Button } from "@/client/components/ui/button";

const validationSchema = v.object({
  name: v.pipe(v.string()),
  image: v.pipe(v.string(), v.url()),
});

type Props = {};

export function UserUpdateForm({}: Props) {
  const { user } = useRouteContext({ from: "/user/" });
  const router = useRouter();

  const q_updateUser = useMutation({
    mutationKey: ["update-user", user.id],
    mutationFn: async (data: v.InferOutput<typeof validationSchema>) =>
      await authClient.updateUser(data),
  });

  const form = useAppForm({
    validators: { onChange: validationSchema },
    defaultValues: {
      name: user.name,
      image: user.image!,
    },
    onSubmit: async ({ value }) => {
      await q_updateUser.mutateAsync(value);
      await router.invalidate();
      toast.success("User updated");
    },
  });

  const userName = useStore(form.store, (state) => state.values.name);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-card-foreground">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <form.Field
            name="image"
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
          <form.AppField name="name" children={(field) => <field.TextField label="Name" />} />
          <form.AppForm>
            <form.SubmitButton label="Submit" />
          </form.AppForm>
        </form>
      </CardContent>
    </Card>
  );
}
