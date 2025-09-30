import type { LolQueueType } from "@puuid/core/shared/types/index";

export const FriendlyQueueTypes = ["solo", "flex", "aram"] as const;
export type FriendlyQueueType = (typeof FriendlyQueueTypes)[number];

export const friendlyQueueTypeToRiot = (type: FriendlyQueueType): LolQueueType => {
  switch (type) {
    case "solo":
      return "RANKED_SOLO_5x5";
    case "flex":
      return "RANKED_FLEX_SR";
    case "aram":
      return "ARAM";
  }
};

export const riotQueueTypeToFriendly = (type: LolQueueType): FriendlyQueueType => {
  switch (type) {
    case "RANKED_SOLO_5x5":
      return "solo";
    case "RANKED_FLEX_SR":
      return "flex";
    case "ARAM":
      return "aram";
  }
};

export type ArrayKeys<T, P = unknown> = {
  [K in keyof T]-?: NonNullable<T[K]> extends readonly P[] | P[] ? K : never;
}[keyof T];

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
