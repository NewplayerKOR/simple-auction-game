import { Achievement, Item, PersistentCareerProfile } from '../types';
import { MASTER_ITEMS } from '../data/masterItems';
import { MASTER_ACHIEVEMENTS } from '../data/masterAchievements';
import { INITIAL_CAREER_PROFILE, STORAGE_KEY_V2, loadProfileFromStorage, useCareerStore } from '../stores/useCareerStore';

export const StorageService = {
  loadUserState(): PersistentCareerProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY_V2);
      if (!data) return { ...INITIAL_CAREER_PROFILE };
      
      JSON.parse(data);
      return loadProfileFromStorage(false);
    } catch (e) {
      console.warn('Failed to load user state from localStorage:', e);
      return { ...INITIAL_CAREER_PROFILE };
    }
  },

  unlockItems(itemIds: string[]): { newUnlocked: string[]; state: PersistentCareerProfile } {
    useCareerStore.setState({ profile: this.loadUserState() });
    const newUnlocked = useCareerStore.getState().unlockItems(itemIds);
    return { newUnlocked, state: useCareerStore.getState().profile };
  },

  unlockAchievements(achievementIds: string[]): { newUnlocked: string[]; state: PersistentCareerProfile } {
    useCareerStore.setState({ profile: this.loadUserState() });
    const before = new Set(useCareerStore.getState().profile.unlockedAchievementIds);
    useCareerStore.getState().unlockAchievements(achievementIds);
    const state = useCareerStore.getState().profile;
    return { newUnlocked: state.unlockedAchievementIds.filter((id) => !before.has(id)), state };
  },

  recordGameResult(isWin: boolean, netWorth: number): PersistentCareerProfile {
    void isWin;
    void netWorth;
    return this.loadUserState();
  },

  getHydratedCodex(): { item: Item; isUnlocked: boolean }[] {
    const current = this.loadUserState();
    const unlockedSet = new Set(current.vaultItemIds);

    return MASTER_ITEMS.map((item) => ({
      item,
      isUnlocked: unlockedSet.has(item.id),
    }));
  },

  getHydratedAchievements(): { achievement: Achievement; isUnlocked: boolean }[] {
    const current = this.loadUserState();
    const unlockedSet = new Set(current.unlockedAchievementIds);

    return MASTER_ACHIEVEMENTS.map((ach) => ({
      achievement: ach,
      isUnlocked: unlockedSet.has(ach.id),
    }));
  },

  resetState(): void {
    useCareerStore.getState().resetCareer();
  }
};
