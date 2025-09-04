import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";

export const FriendlyQueueTypes = ["solo", "flex"] as const;
export type FriendlyQueueType = (typeof FriendlyQueueTypes)[number];

export const friendlyQueueTypeToRiot = (type: FriendlyQueueType): LolQueueType => {
  switch (type) {
    case "solo":
      return "RANKED_SOLO_5x5";
    case "flex":
      return "RANKED_FLEX_SR";
  }
};

export const riotQueueTypeToFriendly = (type: LolQueueType): FriendlyQueueType => {
  switch (type) {
    case "RANKED_SOLO_5x5":
      return "solo";
    case "RANKED_FLEX_SR":
      return "flex";
  }
};

export type ArrayKeys<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends readonly unknown[] | unknown[] ? K : never;
}[keyof T];

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
