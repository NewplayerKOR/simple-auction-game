import { create } from 'zustand';
import { StorageService } from '../services/storageService';
import { Achievement, Item } from '../types';
import { useCareerStore } from './useCareerStore';

interface CodexStoreState {
  isCodexModalOpen: boolean;
  activeTab: 'ITEMS' | 'ACHIEVEMENTS';
  
  openCodexModal: (tab?: 'ITEMS' | 'ACHIEVEMENTS') => void;
  closeCodexModal: () => void;
  setActiveTab: (tab: 'ITEMS' | 'ACHIEVEMENTS') => void;
  
  // 실시간 하이드레이션 게터
  getHydratedItems: () => { item: Item; isUnlocked: boolean }[];
  getHydratedAchievements: () => { achievement: Achievement; isUnlocked: boolean }[];
  
  resetAllData: () => void;
}

export const useCodexStore = create<CodexStoreState>((set) => ({
  isCodexModalOpen: false,
  activeTab: 'ITEMS',

  openCodexModal: (tab = 'ITEMS') => set({ isCodexModalOpen: true, activeTab: tab }),
  closeCodexModal: () => set({ isCodexModalOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  getHydratedItems: () => StorageService.getHydratedCodex(),
  getHydratedAchievements: () => StorageService.getHydratedAchievements(),

  resetAllData: () => {
    useCareerStore.getState().resetCareer();
  }
}));
