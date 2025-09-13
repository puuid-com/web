import { $getUserPage } from "@/server/functions/$getUserPage";
import { createFileRoute, Link, redirect, useRouteContext } from "@tanstack/react-router";
import { Card, CardContent } from "@/client/components/ui/card";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import {
  ExternalLink as ExternalLinkIcon,
  Globe as GlobeIcon,
  Lock as LockIcon,
  Pencil as PencilIcon,
  Share2 as Share2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { SiTwitch, SiX } from "@icons-pack/react-simple-icons";

export const Route = createFileRoute("/page/$name")({
  component: RouteComponent,
  loader: async (ctx) => {
    const { name } = ctx.params;
    const { page } = await $getUserPage({ data: { name } });

    if (!page) {
      throw redirect({ to: "/" });
    }

    return {
      page,
    };
  },
});

function RouteComponent() {
  const { page } = Route.useLoaderData();
  const session = useRouteContext({ from: "__root__" });

  const isOwner = session.userPage?.id === page.id;

  const createdAt = page.createdAt;
  const memberSince = new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(createdAt);

  const xUrl = page.xUsername ? `https://x.com/${page.xUsername}` : null;
  const twitchUrl = page.twitchUsername ? `https://twitch.tv/${page.twitchUsername}` : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  return (
    <div
      className="container mx-auto px-4 py-6"
      style={{ minHeight: "var(--body-content-height)" }}
    >
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[60vh] w-[120vw] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_60%)]" />
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <img
                src={page.profileImage}
                alt={page.displayName}
                className="w-20 h-20 rounded-md border border-neutral-800 object-cover"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-neutral-100 truncate">
                    {page.displayName}
                  </h1>
                  {page.isPublic ? (
                    <Badge variant="main" className="flex items-center gap-1">
                      <GlobeIcon className="size-3" /> Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1 text-neutral-300">
                      <LockIcon className="size-3" /> Private
                    </Badge>
                  )}
                </div>

                <div className="mt-1 text-sm text-neutral-400">
                  {memberSince ? <span>Member since {memberSince}</span> : null}
                </div>

                <p className="mt-3 text-neutral-200 whitespace-pre-wrap break-words">
                  {page.description ?? <span className="text-neutral-400 italic">No bio yet.</span>}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {xUrl ? (
                    <a
                      href={xUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-neutral-300 hover:text-neutral-100"
                    >
                      <SiX color={"white"} className="size-4" /> @{page.xUsername}
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  ) : null}

                  {twitchUrl ? (
                    <a
                      href={twitchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-neutral-300 hover:text-neutral-100"
                    >
                      <SiTwitch className="size-4" color={"default"} /> {page.twitchUsername}
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => void handleCopy()}>
                  <Share2Icon /> Share
                </Button>
                {isOwner ? (
                  <Button asChild variant="secondary" size="sm">
                    <Link to="/user/settings">
                      <PencilIcon /> Edit
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future sections */}
        <div className="text-center text-neutral-400 text-sm">More content coming soon.</div>
      </div>
    </div>
  );
}
