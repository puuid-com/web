export const getPartsFromRiotID = (riotID: string) => {
  const [gameName, tagLine] = riotID.split("#");

  if (!gameName || !tagLine) {
    throw new Error("Invalid Summoner Name : " + riotID);
  }
  return { gameName, tagLine, riotID: riotID };
};
