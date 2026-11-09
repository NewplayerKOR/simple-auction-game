import {
  CategoryMarketRates,
  ContrabandCurseCode,
  Item,
  ItemCondition,
  MarketEvent,
  SynergySet,
} from '../types';
import { APPRAISAL_CONFIG, RESTORATION_CONFIG } from '../data/constants';
import { MASTER_SYNERGIES } from '../data/masterSynergies';
import { applyDumpLossCurse } from './contrabandService';

/**
 * 보존 상태·잭팟 평가의 단일 계약 (DEC-011)
 * - 위작은 항상 0
 * - 잭팟 2.0, 그 외 PRISTINE 1.0 / DUSTY 0.8 / DAMAGED 0.5 / RUINED 0.2
 */
export const getItemConditionMultiplier = (
  condition?: ItemCondition,
  isJackpot?: boolean
): number => {
  if (isJackpot) return 2.0;
  return RESTORATION_CONFIG.CONDITION_VALUE_RATIOS[condition || 'PRISTINE'] ?? 1.0;
};

/** 감정 비용의 권위는 아이템별 `appraisalCost`이며 상수는 fallback이다. (DEC-010) */
export const getAppraisalCost = (item: Item | null): number => {
  if (item && Number.isFinite(item.appraisalCost) && item.appraisalCost >= 0) {
    return Math.floor(item.appraisalCost);
  }
  return APPRAISAL_CONFIG.COST;
};

/** 세션·보관함 공통 조정 가치. 위작은 0으로 평가한다. */
export const getAdjustedItemValue = (item: Item): number => {
  if (item.isFake) return 0;
  return Math.round(item.realValue * getItemConditionMultiplier(item.condition, item.isJackpot));
};

/** 결과 화면·세션 순위용 가치. 활성 시장 이벤트 배수를 조정 가치에 적용한다. */
export const getSessionItemValue = (
  item: Item,
  marketEvent: MarketEvent | null
): number => {
  const adjustedValue = getAdjustedItemValue(item);
  if (
    marketEvent &&
    marketEvent.effectType === 'CATEGORY_MULTIPLIER' &&
    marketEvent.targetCategory === item.category
  ) {
    return Math.floor(adjustedValue * (marketEvent.multiplier ?? 1.5));
  }
  return adjustedValue;
};

/** 위작을 제외한 진품만 시너지 세트 조건과 보너스 계산에 사용한다. */
export const calculateSynergyBonus = (
  items: Item[],
  marketEvent: MarketEvent | null,
  synergies: SynergySet[] = MASTER_SYNERGIES
): number => {
  const genuineItems = items.filter((item) => !item.isFake);
  const ownedIds = new Set(genuineItems.map((item) => item.id));

  return synergies.reduce((bonus, synergy) => {
    const hasAll = synergy.requiredItemIds.every((id) => ownedIds.has(id));
    if (!hasAll) return bonus;

    const setValue = genuineItems
      .filter((item) => synergy.requiredItemIds.includes(item.id))
      .reduce((sum, item) => sum + getSessionItemValue(item, marketEvent), 0);

    return bonus + Math.floor(setValue * synergy.bonusMultiplier);
  }, 0);
};

/**
 * 위탁 판매 수령액의 단일 계산 함수 (DEC-011)
 * - `item`은 마스터 원본이어야 하며, 이미 조정된 하이드레이션 가치를 전달하지 않는다.
 * - 보존 상태·잭팟 배수는 여기서 한 번만 적용한다.
 */
export const calculateConsignmentPayout = (
  item: Item,
  state: { condition: ItemCondition; isJackpot?: boolean } | undefined,
  marketRates: CategoryMarketRates,
  curseCodes: Set<ContrabandCurseCode>
): number => {
  const condition = state?.condition || item.condition || 'PRISTINE';
  const isJackpot = state?.isJackpot ?? item.isJackpot ?? false;

  const adjustedValue = item.isFake
    ? 0
    : Math.round(item.realValue * getItemConditionMultiplier(condition, isJackpot));

  const categoryMarket = marketRates.rates[item.category];
  const baseRate = categoryMarket?.multiplier ?? 1.0;
  const marketRate = categoryMarket?.trend === 'DUMP'
    ? applyDumpLossCurse(baseRate, curseCodes)
    : baseRate;

  return Math.round(adjustedValue * marketRate);
};
