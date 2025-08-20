import type { SummonerType } from "@/server/db/schema";
import {
  VersionsResponseSchema,
  ChampionsResponseSchema,
  SummonerSpellsResponseSchema,
  type FormattedSummonerSpellsType,
  type ChampionsResponseType,
} from "@/client/services/DDragon/types";
import ky from "ky";
import * as v from "valibot";
import type { MatchSummonerRowType } from "@/server/db/match-schema";

export type DDragonMetadata = {
  champions: ChampionsResponseType["data"];
  latest_version: string;
  summoner_spells: FormattedSummonerSpellsType;
};

export class DDragonService {
  private static async getVersions() {
    const response = await ky
      .get(`https://ddragon.leagueoflegends.com/api/versions.json`)
      .json();

    return v.parse(VersionsResponseSchema, response);
  }

  static async getLatestVersion() {
    const versions = await this.getVersions();
    return versions[0]!;
  }

  static async getChampionsData(version: string) {
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;
    const response = await ky.get(url).json();
    return v.parse(ChampionsResponseSchema, response).data;
  }

  static async getSpells(version: string) {
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`;
    const response = await ky.get(url).json();
    const parsed = v.parse(SummonerSpellsResponseSchema, response);

    const reshaped: FormattedSummonerSpellsType = {};
    for (const value of Object.values(parsed.data)) {
      reshaped[value.key] = value;
    }
    return reshaped;
  }

  static getProfileIconUrl(version: string, id: SummonerType["profileIconId"]) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${id}.png`;
  }

  static getChampionName(champions: ChampionsResponseType["data"], id: number) {
    return champions[id]!.name;
  }

  static getItemIconUrl(version: string, id: number) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`;
  }

  static getChampionIconUrl(
    version: string,
    imageFull: ChampionsResponseType["data"][number]["image"]["full"]
  ) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${imageFull}`;
  }

  static getChampionIconUrlFromParticipant(
    champions: ChampionsResponseType["data"],
    version: string,
    p: MatchSummonerRowType
  ) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champions[p.championId]!.image.full}`;
  }

  static getSummonerSpellIconUrl(
    summoner_spells: FormattedSummonerSpellsType,
    version: string,
    id: MatchSummonerRowType["spellIds"][number]
  ) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${summoner_spells[id]!.image.full}`;
  }

  static async getMetadata(): Promise<DDragonMetadata> {
    const version = await DDragonService.getLatestVersion();

    const [spells, champions] = await Promise.all([
      DDragonService.getSpells(version),
      DDragonService.getChampionsData(version),
    ]);

    return {
      champions,
      latest_version: version,
      summoner_spells: spells,
    };
  }

  static async loadMetadata() {
    return DDragonService.getMetadata();
  }
}
