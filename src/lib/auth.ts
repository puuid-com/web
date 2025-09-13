import { db } from "@/server/db";
import { serverEnv } from "@/server/lib/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";
import { genericOAuth } from "better-auth/plugins";
import ky from "ky";
import type { AccountDTOType } from "@/server/api-route/riot/account/AccountDTO";
import type { SummonerDTOType } from "@/server/api-route/riot/summoner/SummonerDTO";
import { eq, sql } from "drizzle-orm";
import { SummonerService } from "@/server/services/summoner/SummonerService";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { summonerTable } from "@/server/db/schema/summoner";
import { UserPage } from "@/server/services/UserPageService";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  trustedOrigins: [serverEnv.BETTER_AUTH_URL],
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          const { accountId, userId } = account;

          const [data] = await db
            .select({
              count: sql<string>`count(*)`,
            })
            .from(summonerTable)
            .where(eq(summonerTable.verifiedUserId, userId));

          const isMain = !data || data.count === "0";

          await db.transaction(async (tx) => {
            const summoner = await SummonerService.getOrCreateSummonerByPuuidTx(
              tx,
              accountId,
              false,
            );

            /**
             * If the account was a main Account, we need to create a page for the user.
             */
            if (isMain) {
              await UserPage.createUserPageTx(tx, {
                userId,
                displayName: summoner.displayRiotId,
                profileImage: CDragonService.getProfileIcon(summoner.profileIconId),
                type: "DEFAULT",
                isPublic: false,
              });
            }

            await tx
              .update(summonerTable)
              .set({
                verifiedUserId: userId,
                isMain,
              })
              .where(eq(summonerTable.puuid, accountId));
          });
        },
      },
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "riot-games",
          clientId: serverEnv.RIOT_CLIENT_ID,
          clientSecret: serverEnv.RIOT_CLIENT_SECRET,
          discoveryUrl: "https://auth.riotgames.com/.well-known/openid-configuration",
          scopes: ["openid", "offline_access", "cpid"],
          pkce: true,
          redirectURI: `${serverEnv.BETTER_AUTH_URL}/api/auth/callback/riot-games`,
          authorizationUrlParams: {
            prompt: "login",
          },
          getUserInfo: async (tokens) => {
            const accessToken = tokens.accessToken;

            const response = await ky
              .get("https://auth.riotgames.com/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
              })
              .json<{
                sub: string;
                cpid: string;
                jti: string;
              }>();

            // Choix d’un cluster pour /accounts/me, les données sont identiques sur americas, europe, asia
            const accountResponse = await ky
              .get(`https://europe.api.riotgames.com/riot/account/v1/accounts/me`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              })
              .json<AccountDTOType>();

            const summonerResponse = await ky
              .get(`https://${response.cpid}.api.riotgames.com/lol/summoner/v4/summoners/me`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              })
              .json<SummonerDTOType>();

            return {
              id: accountResponse.puuid,
              name: `${accountResponse.gameName}#${accountResponse.tagLine}`,
              email: `${accountResponse.puuid}@puuid.com`,
              image: CDragonService.getProfileIcon(summonerResponse.profileIconId),
              createdAt: new Date(),
              updatedAt: new Date(),
              emailVerified: true,
            };
          },
          /*  mapProfileToUser: (profile) => {
            return {
              ...profile,
              puuid: profile.id as string,
            };
          }, */
        },
      ],
    }),
    reactStartCookies(),
  ],
  socialProviders: {
    github: {
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
      redirectURI: `${serverEnv.BETTER_AUTH_URL}/api/auth/callback/github`,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      trustedProviders: ["riot-games"],
    },
  },
});
