"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/client/components/ui/avatar";
import { Button } from "@/client/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

type Props = {};

export function UserAccountButton({}: Props) {
  const session = authClient.useSession();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigateToUsers = async () => {
    await navigate({ to: "/user" });
    setIsOpen(false);
  };

  const signInWithRiot = async () => {
    await authClient.signIn.oauth2({
      providerId: "riot-games",
    });
  };

  const signOutWithRiot = async () => {
    await authClient.signOut();
    setIsOpen(false);
  };

  const currentUser = session.data?.user;

  if (!currentUser) {
    return <Button onClick={() => void signInWithRiot()}>Sign In</Button>;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white"
        >
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={currentUser.image ?? "/placeholder.svg"} alt={currentUser.name} />
            <AvatarFallback className="bg-zinc-700 text-white text-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{currentUser.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white">
        <div className="px-3 py-2">
          <Link
            to={"/lol/summoner/$riotID/matches"}
            params={{
              riotID: currentUser.name,
            }}
            search={{
              q: "solo",
            }}
          >
            <p className="text-sm font-medium">{currentUser.name}</p>
          </Link>
        </div>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={() => void handleNavigateToUsers()}
          className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={() => void signOutWithRiot()}
          className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer text-red-400 hover:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
