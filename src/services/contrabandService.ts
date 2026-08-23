import { ContrabandCurseCode, Item } from '../types';
import { MASTER_ITEMS } from '../data/masterItems';

const CURSE_BY_ITEM_ID = new Map(
  MASTER_ITEMS.filter((item) => item.curseCode).map((item) => [item.id, item.curseCode!])
);

export const getOwnedCurseCodes = (
  vaultItemIds: string[],
  sessionItems: Item[] = []
): Set<ContrabandCurseCode> => {
  const codes = new Set<ContrabandCurseCode>();

  for (const id of vaultItemIds) {
    const code = CURSE_BY_ITEM_ID.get(id);
    if (code) codes.add(code);
  }

  for (const item of sessionItems) {
    if (!item.isFake && item.curseCode) codes.add(item.curseCode);
  }

  return codes;
};

export const applyEndGameCashCurse = (
  endingCash: number,
  curseCodes: Set<ContrabandCurseCode>
): number => curseCodes.has('END_GAME_CASH_FEE') ? endingCash - 1000 : endingCash;

export const getDutchBotLatencyMultiplier = (
  curseCodes: Set<ContrabandCurseCode>
): number => curseCodes.has('DUTCH_BOT_LATENCY_20') ? 0.8 : 1;

export const getPoliceRaidChance = (
  curseCodes: Set<ContrabandCurseCode>
): number => curseCodes.has('POLICE_RAID_CHANCE_30') ? 0.30 : 0.15;

export const applyDumpLossCurse = (
  baseMultiplier: number,
  curseCodes: Set<ContrabandCurseCode>
): number => {
  if (!curseCodes.has('DUMP_LOSS_X1_5') || baseMultiplier >= 1) return baseMultiplier;
  return Math.max(0, 1 - (1 - baseMultiplier) * 1.5);
};

export const getLoanRepaymentAmount = (
  curseCodes: Set<ContrabandCurseCode>
): number => curseCodes.has('LOAN_INTEREST_30') ? 3900 : 3600;

export const getRestorationProbabilities = (
  curseCodes: Set<ContrabandCurseCode>
) => curseCodes.has('RESTORE_FAIL_PLUS_10P')
  ? { success: 0.60, jackpot: 0.10, failed: 0.30 }
  : { success: 0.70, jackpot: 0.10, failed: 0.20 };
