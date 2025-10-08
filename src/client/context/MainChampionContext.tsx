import type { SummonerType } from "@puuid/core/server/db/types";
import React from "react";

type ContextType = {
  backgroundColor: string | null;
  foregroundColor: string | null;
  skinId: number | null;

  handleTempColorChange: (backgroundColor: string, foregroundColor: string, skinId: number) => void;
  handleTempColorReset: () => void;
  handleSaveTempData: () => void;
};

const context = React.createContext<ContextType>({} as ContextType);

// eslint-disable-next-line react-refresh/only-export-components
export const useMainChampionContext = () => {
  const _context = React.useContext(context);

  return _context;
};

type Props = {
  summoner: SummonerType;
};

export const MainChampionProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  summoner,
}) => {
  const [tempBackgroundColor, setTempBackgroundColor] = React.useState<string | null>(null);
  const [tempForegroundColor, setTempForegroundColor] = React.useState<string | null>(null);
  const [tempSkinId, setTempSkinId] = React.useState<number | null>(null);

  const [backgroundColor, setBackgroundColor] = React.useState<string | null>(
    summoner.mainChampionBackgroundColor ?? null,
  );
  const [foregroundColor, setForegroundColor] = React.useState<string | null>(
    summoner.mainChampionForegroundColor ?? null,
  );
  const [skinId, setSkinId] = React.useState<number | null>(summoner.mainChampionSkinId ?? null);

  React.useEffect(() => {
    setBackgroundColor(summoner.mainChampionBackgroundColor ?? null);
    setForegroundColor(summoner.mainChampionForegroundColor ?? null);
    setSkinId(summoner.mainChampionSkinId ?? null);
  }, [
    summoner.mainChampionBackgroundColor,
    summoner.mainChampionForegroundColor,
    summoner.mainChampionSkinId,
  ]);

  const handleTempColorChange = React.useCallback(
    (backgroundColor: string, foregroundColor: string, skinId: number) => {
      setTempBackgroundColor(backgroundColor);
      setTempForegroundColor(foregroundColor);
      setTempSkinId(skinId);
    },
    [],
  );

  const handleTempColorReset = React.useCallback(() => {
    setTempBackgroundColor(null);
    setTempForegroundColor(null);
    setTempSkinId(null);
  }, []);

  const handleSaveTempData = React.useCallback(() => {
    setBackgroundColor(tempBackgroundColor);
    setForegroundColor(tempForegroundColor);
    setSkinId(tempSkinId);

    handleTempColorReset();
  }, [handleTempColorReset, tempBackgroundColor, tempForegroundColor, tempSkinId]);

  const value = React.useMemo<ContextType>(() => {
    return {
      backgroundColor: tempBackgroundColor ?? backgroundColor,
      foregroundColor: tempForegroundColor ?? foregroundColor,
      skinId: tempSkinId ?? skinId,
      handleTempColorChange,
      handleTempColorReset,
      handleSaveTempData,
    };
  }, [
    backgroundColor,
    foregroundColor,
    handleSaveTempData,
    handleTempColorChange,
    handleTempColorReset,
    skinId,
    tempBackgroundColor,
    tempForegroundColor,
    tempSkinId,
  ]);

  return (
    <context.Provider value={value}>
      <div
        style={
          {
            "--color-main": value.backgroundColor ?? undefined,
            "--color-main-foreground": value.foregroundColor ?? undefined,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </context.Provider>
  );
};
