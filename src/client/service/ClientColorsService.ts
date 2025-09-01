import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { Vibrant } from "node-vibrant/browser";

export class ClientColorsService {
  static async getMainColorsFromChampionSkin(championId: number, skinId: number) {
    const mainChampionSplashImageUrl = CDragonService.getChampionSplashArtCenteredSkin(
      championId,
      skinId,
    );

    return this.getColorsFromUrl(mainChampionSplashImageUrl);
  }

  private static async getColorsFromUrl(url: string) {
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
