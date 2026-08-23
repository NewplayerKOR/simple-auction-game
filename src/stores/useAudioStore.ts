import { create } from 'zustand';
import { AudioService, BgmType } from '../services/audioService';

interface AudioStoreState {
  isMuted: boolean;
  sfxVolume: number;
  bgmVolume: number;
  currentBgm: BgmType;
  
  toggleMute: () => void;
  setSfxVolume: (vol: number) => void;
  setBgmVolume: (vol: number) => void;
  playBGM: (type: BgmType) => void;
  stopBGM: () => void;
  
  // SFX 트리거 10종
  playGavel: () => void;
  playChip: () => void;
  playBell: () => void;
  playTick: (isUrgent?: boolean) => void;
  playHeartbeat: () => void;
  playCard: () => void;
  playJackpot: () => void;
  playLoss: () => void;
  playDiscard: () => void;
  playNews: () => void;
}

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  isMuted: false,
  sfxVolume: 0.8,
  bgmVolume: 0.35,
  currentBgm: 'NONE',

  toggleMute: () => {
    const nextMuted = !get().isMuted;
    AudioService.setMuted(nextMuted);
    set({ isMuted: nextMuted });
  },

  setSfxVolume: (vol: number) => {
    AudioService.setSfxVolume(vol);
    set({ sfxVolume: vol });
  },

  setBgmVolume: (vol: number) => {
    AudioService.setBgmVolume(vol);
    set({ bgmVolume: vol });
  },

  playBGM: (type: BgmType) => {
    AudioService.playBGM(type);
    set({ currentBgm: type });
  },

  stopBGM: () => {
    AudioService.stopBGM();
    set({ currentBgm: 'NONE' });
  },

  playGavel: () => AudioService.playGavelStrike(),
  playChip: () => AudioService.playChipClick(),
  playBell: () => AudioService.playBidBell(),
  playTick: (isUrgent) => AudioService.playTick(isUrgent),
  playHeartbeat: () => AudioService.playHeartbeat(),
  playCard: () => AudioService.playCardUse(),
  playJackpot: () => AudioService.playJackpot(),
  playLoss: () => AudioService.playLoss(),
  playDiscard: () => AudioService.playDiscard(),
  playNews: () => AudioService.playNewsAlert(),
}));
