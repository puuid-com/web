import { CDragonService } from "@puuid/core/shared/services/CDragonService";

let vibrantModulePromise: Promise<typeof import("node-vibrant/browser")> | undefined;

const loadVibrant = async () => {
  vibrantModulePromise ??= import("node-vibrant/browser");

  return vibrantModulePromise;
};

export class ClientColorsService {
  static async getMainColorsFromChampionSkin(championId: number, skinId: number) {
    const mainChampionSplashImageUrl = CDragonService.getChampionSplashArtCenteredSkin(
      championId,
      skinId,
    );

    return this.getColorsFromUrl(mainChampionSplashImageUrl);
  }

  private static async getColorsFromUrl(url: string) {
    const Vibrant = (await loadVibrant()).Vibrant;
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
