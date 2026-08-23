import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCareerStore, STORAGE_KEY_V2 } from '../src/stores/useCareerStore';
import { MASTER_ITEMS } from '../src/data/masterItems';
import { RESTORATION_CONFIG } from '../src/data/constants';

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

describe('QA-408: 유물 복원 공방 (70% 성공, 10% 잭팟 2배, 20% 파손 Ruined)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useCareerStore.getState().resetCareer();
  });

  it('보관함에 유물이 없거나 현금이 부족하면 에러를 던져야 한다', () => {
    const store = useCareerStore.getState();
    expect(() => store.attemptRestoration('item_br_01')).toThrow();
  });

  it('70% 성공 시 상태가 PRISTINE(가치 100%)으로 회복되고 비용이 차감되어야 한다', () => {
    const item = MASTER_ITEMS[0]; // item_br_01
    useCareerStore.setState({
      profile: {
        ...useCareerStore.getState().profile,
        careerCash: 10000,
        vaultItemIds: [item.id],
        vaultItemStates: {
          [item.id]: { condition: 'DAMAGED', isJackpot: false }
        }
      }
    });

    // Math.random Mock -> 0.35 (70% 성공 구간)
    vi.spyOn(Math, 'random').mockReturnValue(0.35);

    const result = useCareerStore.getState().attemptRestoration(item.id);

    expect(result.outcome).toBe('SUCCESS');
    expect(result.newCondition).toBe('PRISTINE');
    expect(useCareerStore.getState().profile.vaultItemStates?.[item.id].condition).toBe('PRISTINE');
    expect(useCareerStore.getState().profile.careerCash).toBe(10000 - (item.restorationCost || 500));

    vi.restoreAllMocks();
  });

  it('10% 잭팟 시 2배 가치 폭등(isJackpot: true)이 반영되어야 한다', () => {
    const item = MASTER_ITEMS[0];
    useCareerStore.setState({
      profile: {
        ...useCareerStore.getState().profile,
        careerCash: 10000,
        vaultItemIds: [item.id],
        vaultItemStates: {
          [item.id]: { condition: 'DUSTY', isJackpot: false }
        }
      }
    });

    // Math.random Mock -> 0.75 (70% ~ 80% 구간: 잭팟)
    vi.spyOn(Math, 'random').mockReturnValue(0.75);

    const result = useCareerStore.getState().attemptRestoration(item.id);

    expect(result.outcome).toBe('JACKPOT');
    expect(result.newCondition).toBe('PRISTINE');
    expect(useCareerStore.getState().profile.vaultItemStates?.[item.id].isJackpot).toBe(true);

    const hydrated = useCareerStore.getState().getHydratedVaultItems();
    const targetHydrated = hydrated.find((h) => h.id === item.id);
    expect(targetHydrated?.realValue).toBe(item.realValue * 2);

    vi.restoreAllMocks();
  });

  it('20% 복원 실패 시 RUINED (가치 20%)로 영구 훼손되어야 한다', () => {
    const item = MASTER_ITEMS[0];
    useCareerStore.setState({
      profile: {
        ...useCareerStore.getState().profile,
        careerCash: 10000,
        vaultItemIds: [item.id],
        vaultItemStates: {
          [item.id]: { condition: 'DAMAGED', isJackpot: false }
        }
      }
    });

    // Math.random Mock -> 0.90 (80% ~ 100% 구간: 실패 파손)
    vi.spyOn(Math, 'random').mockReturnValue(0.90);

    const result = useCareerStore.getState().attemptRestoration(item.id);

    expect(result.outcome).toBe('FAILED_RUINED');
    expect(result.newCondition).toBe('RUINED');
    expect(useCareerStore.getState().profile.vaultItemStates?.[item.id].condition).toBe('RUINED');

    const hydrated = useCareerStore.getState().getHydratedVaultItems();
    const targetHydrated = hydrated.find((h) => h.id === item.id);
    expect(targetHydrated?.realValue).toBe(Math.round(item.realValue * 0.2));

    vi.restoreAllMocks();
  });
});
