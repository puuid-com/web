import { CDragonService } from "@/shared/services/CDragon/CDragonService";

export class ServerColorsService {
  static async getMainColorsFromChampion(championId: number) {
    const mainChampionSplashImageUrl = CDragonService.getChampionSplashArtCentered(championId);

    return this.getColorsFromUrl(mainChampionSplashImageUrl);
  }

  static async getMainColorsFromChampionSkin(championId: number, skinId: number) {
    const mainChampionSplashImageUrl = CDragonService.getChampionSplashArtCenteredSkin(
      championId,
      skinId,
    );

    return this.getColorsFromUrl(mainChampionSplashImageUrl);
  }

  static async getMainColorsFromProfileIcon(profileIconId: number) {
    const profileIconUrl = CDragonService.getProfileIcon(profileIconId);

    return this.getColorsFromUrl(profileIconUrl);
  }

  private static async getColorsFromUrl(url: string) {
    const { Vibrant } = await import("node-vibrant/node");
    const palette = await Vibrant.from(url).getPalette();

    if (palette.Vibrant) {
      return {
        foregroundColor: palette.Vibrant.bodyTextColor,
        backgroundColor: palette.Vibrant.hex,
      };
    }

    return {
      foregroundColor: undefined,
      backgroundColor: undefined,
    };
  }
}
