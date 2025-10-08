"use client";

import { useState } from "react";
import { Button } from "@/client/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/client/components/ui/dropdown-menu";
import { User, LogOut, BrainIcon, RatIcon, FileUserIcon } from "lucide-react";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import React from "react";

type Props = {};

export function UserAccountButton({}: Props) {
  const session = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigateToUsers = async () => {
    await navigate({ to: "/user/settings" });
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

  const handleNavigateToUserPage = async () => {
    if (session.userPage) {
      await navigate({
        to: "/page/$name",
        params: {
          name: session.userPage.displayName,
        },
      });
    }
  };

  if (!session.user) {
    return <Button onClick={() => void signInWithRiot()}>Sign In</Button>;
  }

  const { summoners } = session;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} className={"px-1"}>
          <img
            src={session.userPage.profileImage}
            alt=""
            className={"rounded-md w-8 aspect-square"}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-white">
        <DropdownMenuLabel>Your summoners</DropdownMenuLabel>
        {summoners.map(({ summoner: s, type }) => {
          const [gameName, tagLine] = s.displayRiotId.split("#");

          const bgColor = s.mainChampionBackgroundColor;
          const textColor = s.mainChampionForegroundColor;

          return (
            <DropdownMenuItem key={s.puuid} asChild>
              <Link
                to={"/lol/summoner/$riotID/matches"}
                params={{
                  riotID: s.displayRiotId,
                }}
                search={{
                  q: "solo",
                  p: 1,
                }}
                style={
                  {
                    "--color-main": bgColor ?? "var(--color-neutral-500)",
                    "--color-main-foreground": textColor ?? undefined,
                  } as React.CSSProperties
                }
              >
                {type === "MAIN" ? (
                  <React.Fragment>
                    <BrainIcon className={"text-main"} />
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <RatIcon className={"text-main"} />
                  </React.Fragment>
                )}
                <span>{gameName}</span>
                <span className="text-muted-foreground tabular-nums">#{tagLine}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem
          onClick={() => void handleNavigateToUsers()}
          className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void handleNavigateToUserPage()}
          className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
        >
          <FileUserIcon className="mr-2 h-4 w-4" />
          <span>{"Your Page"}</span>
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
