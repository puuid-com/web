import type { LolIndividualPositionType } from "@/server/api-route/riot/match/MatchDTO";
import type { $GetChampionsDataType } from "@/server/functions/$getChampionsData";
import type { $GetSummonerActiveMatchType } from "@/server/functions/$getSummonerActiveMatch";

type Participant = NonNullable<$GetSummonerActiveMatchType>["participants"][number];

const POSITION_ORDER: readonly LolIndividualPositionType[] = [
  "TOP",
  "JUNGLE",
  "MIDDLE",
  "BOTTOM",
  "UTILITY",
];

const SMITE = 11;
const HEAL = 7;
const CLEANSE = 1;
const EXHAUST = 3;
const TELEPORT = 12;
const BARRIER = 21;

function getSpells(p: Participant): [number, number] {
  return [p.spell1Id, p.spell2Id];
}

function hasSpell(p: Participant, id: number): boolean {
  const [a, b] = getSpells(p);
  return a === id || b === id;
}

function gamesForChampion(meta: $GetChampionsDataType[number] | undefined): number {
  const w = typeof meta?.wins === "number" ? meta.wins : 0;
  const l = typeof meta?.losses === "number" ? meta.losses : 0;
  return w + l;
}

function scoreCandidate(
  role: LolIndividualPositionType,
  p: Participant,
  meta: $GetChampionsDataType[number] | undefined,
  lobbyIndex: number,
): number {
  let score = 0;
  if (hasSpell(p, SMITE)) {
    score += role === "JUNGLE" ? 1000 : -300;
  }
  const main = meta?.mainIndividualPosition;
  if (main === role) score += 500;
  if (!hasSpell(p, SMITE)) {
    if (hasSpell(p, HEAL) || hasSpell(p, CLEANSE)) {
      if (role === "BOTTOM") score += 200;
    }
    if (hasSpell(p, EXHAUST)) {
      score += role === "UTILITY" ? 180 : -40;
    }
    if (hasSpell(p, TELEPORT)) {
      if (role === "TOP") score += 120;
      if (role === "MIDDLE") score += 80;
    }
    if (hasSpell(p, BARRIER)) {
      if (role === "MIDDLE") score += 60;
    }
  }
  const g = gamesForChampion(meta);
  score += g > 100 ? 100 : g;
  const bias = 50 - lobbyIndex;
  score += bias > 0 ? bias : 0;
  return score;
}

export function assignAndSortParticipantsByRole(
  list: Participant[],
  championsData: $GetChampionsDataType,
): Participant[] {
  const participants = list.map((p, i) => ({ p, i }));

  type Edge = { role: LolIndividualPositionType; idx: number; score: number };
  const edges: Edge[] = [];

  for (let i = 0; i < participants.length; i++) {
    const participant = participants[i]!;
    const lobbyIndex = participant.i;
    const meta = championsData[participant.p.championId];
    for (const role of POSITION_ORDER) {
      const s = scoreCandidate(role, participant.p, meta, lobbyIndex);
      edges.push({ role, idx: i, score: s });
    }
  }

  edges.sort((a, b) => b.score - a.score);

  const roleToIdx = new Map<LolIndividualPositionType, number>();
  const used = new Set<number>();

  for (const e of edges) {
    if (roleToIdx.has(e.role)) continue;
    if (used.has(e.idx)) continue;
    roleToIdx.set(e.role, e.idx);
    used.add(e.idx);
    if (roleToIdx.size === POSITION_ORDER.length) break;
  }

  if (roleToIdx.size < POSITION_ORDER.length) {
    const remainingRoles: LolIndividualPositionType[] = [];
    for (const r of POSITION_ORDER) {
      if (!roleToIdx.has(r)) remainingRoles.push(r);
    }
    const remainingIdx: number[] = [];
    for (let i = 0; i < participants.length; i++) {
      if (!used.has(i)) remainingIdx.push(i);
    }
    const len = Math.min(remainingRoles.length, remainingIdx.length);
    for (let k = 0; k < len; k++) {
      const role = remainingRoles[k]!;
      const idx = remainingIdx[k]!;

      roleToIdx.set(role, idx);
      used.add(idx);
    }
  }

  const out: Participant[] = [];
  for (const role of POSITION_ORDER) {
    const idx = roleToIdx.get(role) ?? 0;
    const chosen = participants[idx]!;
    out.push(chosen.p);
  }
  return out;
}
