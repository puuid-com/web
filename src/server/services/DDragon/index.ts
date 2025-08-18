import type { MatchParticipantDTOType } from "@/server/api-route/riot/match/MatchDTO";
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

    // Fetch the data using ky
    const response = await ky.get(url).json();

    // Parse the response with valibot
    const parsed = v.parse(SummonerSpellsResponseSchema, response);

    // Reshape: key is the numeric 'key' (id), value is the summoner data
    const reshaped: FormattedSummonerSpellsType = {};

    for (const value of Object.values(parsed.data)) {
      reshaped[value.key] = value;
    }

    return reshaped;
  }

  static async getUrls(version: string) {
    return {
      profil_icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/{id}.png`,
      champion_image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/{id}`,
      summoner_spell_icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/{id}`,
      item_icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/{id}.png`,
      rune_icon: ``,
    };
  }

  static async getMetadata() {
    const version = await DDragonService.getLatestVersion();

    const [spells, champions] = await Promise.all([
      DDragonService.getSpells(version),
      DDragonService.getChampionsData(version),
    ]);

    return {
      champions: champions,
      latest_version: version,
      summoner_spells: spells,
      urls: {
        profil_icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/{id}.png`,
        champion_image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/{id}`,
        summoner_spell_icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/{id}`,
        item_icon: `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/{id}.png`,
        rune_icon: ``,
      },
    };
  }

  static async loadMetadata() {
    const data = await DDragonService.getMetadata();

    const getProfileIconUrl = (id: SummonerType["profileIconId"]) => {
      return data.urls.profil_icon.replace("{id}", String(id));
    };

    const getChampionIconUrl = (
      id: ChampionsResponseType["data"][number]["image"]["full"]
    ) => {
      return data.urls.champion_image.replace("{id}", String(id));
    };

    const getChampionIconUrlFromParticipant = (p: MatchParticipantDTOType) => {
      return getChampionIconUrl(data.champions[p.championId]!.image.full);
    };

    const getItemIconUrl = (id: number) => {
      return data.urls.item_icon.replace("{id}", String(id));
    };

    const getSummonerSpellIconUrl = (
      id: MatchParticipantDTOType["summoner1Id"]
    ) => {
      return data.urls.summoner_spell_icon.replace(
        "{id}",
        data.summoner_spells[id]!.image.full
      );
    };

    return {
      ...data,
      /*getQueueName: (queueId: MatchType["queueId"]) => {
        switch (queueId) {
          case 420:
            return "Ranked Solo/Duo";
          case 440:
            return "Ranked Flex";
          case 450:
            return "Aram";
          case 400:
          case 430:
            return "Normal";
        }
      },
      urls: {
        getProfileIconUrl,
        getChampionIconUrl,
        getChampionIconUrlFromParticipant,
        getItemIconUrl,
        getSummonerSpellIconUrl,
      },*/
    };
  }
}
