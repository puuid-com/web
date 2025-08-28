import { Badge } from "@/client/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Separator } from "@/client/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      <Card className="border-neutral-700 bg-neutral-900 text-neutral-100 shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-semibold text-white">Privacy Policy</CardTitle>
            <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-600/40">
              Updated
            </Badge>
          </div>
          <CardDescription className="text-neutral-300">
            Effective date: 24 July 2025
          </CardDescription>
        </CardHeader>

        <Separator className="bg-neutral-800" />

        {/* Larger font size and generous line-height */}
        <CardContent className="text-[16px] leading-7 space-y-6">
          <p className="text-neutral-200">
            championsmastery.lol is an independent web application that aggregates mastery data from
            the Riot Games API for League of Legends players. Contact:{" "}
            <span className="text-neutral-100">olivierdeschenes9@gmail.com</span>
          </p>

          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <h3 className="font-semibold text-white">Who we are</h3>
              <p className="text-neutral-200">
                An independent site for viewing champion mastery statistics.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-white">What we collect</h3>
              <p className="text-neutral-200">
                Riot API responses (raw match and profile data) when you request information for
                specific summoners. We do not store personal user data, cookies, or analytics.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-white">How we use the data</h3>
              <p className="text-neutral-200">
                To generate cumulative champion&#8209;mastery views and to diagnose/correct service
                issues.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-white">Public display</h3>
              <p className="text-neutral-200">
                Mastery statistics are visible to anyone with the relevant account identifiers.
                Submit only accounts you are comfortable sharing.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-white">Data retention</h3>
              <p className="text-neutral-200">
                Stored Riot API responses are kept until replaced by newer data or removed during
                routine maintenance.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-white">Security</h3>
              <p className="text-neutral-200">
                Industry‑standard measures are used to protect stored data, but no online service
                can guarantee absolute security.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-white">Your rights</h3>
              <p className="text-neutral-200">
                We do not hold personal data about you, so typical access or deletion requests
                generally do not apply. For concerns, email the address above.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-white">Changes to this policy</h3>
              <p className="text-neutral-200">
                We may update this Privacy Policy. Continued use of the site after an update
                signifies acceptance.
              </p>
            </li>
            <li>
              <h3 className="font-semibold text-white">Governing law</h3>
              <p className="text-neutral-200">
                This policy is governed by the laws of Quebec, Canada.
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>
    </section>
  );
}
