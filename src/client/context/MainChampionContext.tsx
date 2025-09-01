import React from "react";

type ContextType = {
  backgroundColor: string | undefined;
  foregroundColor: string | undefined;
  skinId: number | undefined;

  handleTempColorChange: (backgroundColor: string, foregroundColor: string, skinId: number) => void;
  handleTempColorReset: () => void;
  handleSaveTempData: () => void;
};

const context = React.createContext<ContextType>({} as ContextType);

// eslint-disable-next-line react-refresh/only-export-components
export const useChampionContext = () => {
  const _context = React.useContext(context);

  return _context;
};

type Props = {
  backgroundColor: string | undefined;
  foregroundColor: string | undefined;
  skinId: number | undefined;
};

export const ChampionProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  backgroundColor: _backgroundColor,
  foregroundColor: _foregroundColor,
  skinId: _skinId,
}) => {
  const [tempBackgroundColor, setTempBackgroundColor] = React.useState<string | undefined>(
    undefined,
  );
  const [tempForegroundColor, setTempForegroundColor] = React.useState<string | undefined>(
    undefined,
  );
  const [tempSkinId, setTempSkinId] = React.useState<number | undefined>(undefined);

  const [backgroundColor, setBackgroundColor] = React.useState<string | undefined>(
    _backgroundColor,
  );
  const [foregroundColor, setForegroundColor] = React.useState<string | undefined>(
    _foregroundColor,
  );
  const [skinId, setSkinId] = React.useState<number | undefined>(_skinId);

  React.useEffect(() => {
    setBackgroundColor(_backgroundColor);
    setForegroundColor(_foregroundColor);
    setSkinId(_skinId);
  }, [_backgroundColor, _foregroundColor, _skinId]);

  const handleTempColorChange = React.useCallback(
    (backgroundColor: string, foregroundColor: string, skinId: number) => {
      setTempBackgroundColor(backgroundColor);
      setTempForegroundColor(foregroundColor);
      setTempSkinId(skinId);
    },
    [],
  );

  const handleTempColorReset = React.useCallback(() => {
    setTempBackgroundColor(undefined);
    setTempForegroundColor(undefined);
    setTempSkinId(undefined);
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

  return <context.Provider value={value}>{children}</context.Provider>;
};
