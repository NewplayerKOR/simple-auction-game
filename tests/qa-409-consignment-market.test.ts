import { describe, it, expect, beforeEach } from 'vitest';
import { useCareerStore, generateRandomMarketRates } from '../src/stores/useCareerStore';
import { MASTER_ITEMS } from '../src/data/masterItems';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

describe('QA-409: 코인급 극심한 시세 변동(-60%~+300%) & 위탁 리셀 마켓', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useCareerStore.getState().resetCareer();
  });

  it('시세 생성 시 3대 카테고리 모두 0.4x ~ 3.5x 범위 내의 승수를 가져야 한다', () => {
    for (let i = 0; i < 20; i++) {
      const rates = generateRandomMarketRates(i);
      expect(rates.rates.PAINTING.multiplier).toBeGreaterThanOrEqual(0.4);
      expect(rates.rates.PAINTING.multiplier).toBeLessThanOrEqual(3.5);
      expect(rates.rates.ANTIQUE.multiplier).toBeGreaterThanOrEqual(0.4);
      expect(rates.rates.ANTIQUE.multiplier).toBeLessThanOrEqual(3.5);
      expect(rates.rates.JEWELRY.multiplier).toBeGreaterThanOrEqual(0.4);
      expect(rates.rates.JEWELRY.multiplier).toBeLessThanOrEqual(3.5);
    }
  });

  it('위탁 리셀 시 시장 시세 배율이 적용된 정확한 현금을 수령하고 보관함에서 유물이 제거되어야 한다', () => {
    const item = MASTER_ITEMS.find((m) => m.category === 'PAINTING')!;
    const initialCash = 5000;

    useCareerStore.setState({
      profile: {
        ...useCareerStore.getState().profile,
        careerCash: initialCash,
        vaultItemIds: [item.id],
        vaultItemStates: {
          [item.id]: { condition: 'PRISTINE', isJackpot: false }
        }
      },
      marketRates: {
        lastUpdatedGame: 1,
        rates: {
          PAINTING: { multiplier: 2.5, trend: 'PUMP', newsHeadline: '회화 2.5배 떡상' },
          ANTIQUE: { multiplier: 1.0, trend: 'STABLE', newsHeadline: '보합' },
          JEWELRY: { multiplier: 1.0, trend: 'STABLE', newsHeadline: '보합' }
        }
      }
    });

    const expectedPayout = Math.round(item.realValue * 1.0 * 2.5);
    const { payout } = useCareerStore.getState().sellConsignmentItem(item.id);

    expect(payout).toBe(expectedPayout);
    expect(useCareerStore.getState().profile.careerCash).toBe(initialCash + expectedPayout);
    expect(useCareerStore.getState().profile.vaultItemIds).not.toContain(item.id);
  });
});
