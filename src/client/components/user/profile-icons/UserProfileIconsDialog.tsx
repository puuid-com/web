import LoadingScreen from "@/client/components/Loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/client/components/ui/dialog";
import { UserProfileIconsList } from "@/client/components/user/profile-icons/UserProfileIconsList";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type Props = {
  onChange: (url: string) => void;
};

export const UserProfileIconsDialog = ({ onChange, children }: React.PropsWithChildren<Props>) => {
  const [open, setOpen] = React.useState(false);

  const { data, status } = useQuery({
    queryKey: ["get-profile-icons"],
    queryFn: async () => {
      const lastVersion = await DDragonService.getLatestVersion();
      const icons = await DDragonService.getProfileIcons(lastVersion);
      return { icons: icons, version: lastVersion };
    },
    enabled: open,
  });

  const handleOnChange = (url: string) => {
    onChange(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={"hover:cursor-pointer"}>
        {children}
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Change Profile Picture</DialogTitle>
          <DialogDescription>
            Select a new profile picture from the list of available icons.
          </DialogDescription>
          {status === "pending" ? (
            <LoadingScreen />
          ) : status === "error" ? (
            <DialogContent className={"text-white"}>Failed to load profile icons</DialogContent>
          ) : (
            <UserProfileIconsList
              icons={data.icons}
              version={data.version}
              onChange={handleOnChange}
            />
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
