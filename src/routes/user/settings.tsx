import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { UserUpdateForm } from "@/client/components/user/UserUpdateForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/user/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <UserUpdateForm />
      </CardContent>
    </Card>
  );
}
