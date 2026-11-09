import { create } from 'zustand';
import { AudioService, BgmType } from '../services/audioService';

export const AUDIO_STORAGE_KEY = 'SIMPLE_AUCTION_AUDIO_V1';

export interface AudioSettings {
  isMuted: boolean;
  sfxVolume: number;
  bgmVolume: number;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  isMuted: false,
  sfxVolume: 0.8,
  bgmVolume: 0.35,
};

const clampVolume = (value: unknown, fallback: number): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
};

/** 저장된 오디오 설정을 검증해 읽는다. 손상·부재 시 기본값을 사용한다. */
export const loadAudioSettings = (): AudioSettings => {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_AUDIO_SETTINGS };
  try {
    const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AUDIO_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      isMuted: parsed.isMuted === true,
      sfxVolume: clampVolume(parsed.sfxVolume, DEFAULT_AUDIO_SETTINGS.sfxVolume),
      bgmVolume: clampVolume(parsed.bgmVolume, DEFAULT_AUDIO_SETTINGS.bgmVolume),
    };
  } catch (error) {
    console.warn('[AudioStore] Failed to load saved audio settings.', error);
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
};

const saveAudioSettings = (settings: AudioSettings): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('[AudioStore] Failed to save audio settings.', error);
  }
};

const initialSettings = loadAudioSettings();
AudioService.setMuted(initialSettings.isMuted);
AudioService.setSfxVolume(initialSettings.sfxVolume);
AudioService.setBgmVolume(initialSettings.bgmVolume);

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
  ...initialSettings,
  currentBgm: 'NONE',

  toggleMute: () => {
    const nextMuted = !get().isMuted;
    AudioService.setMuted(nextMuted);
    saveAudioSettings({
      isMuted: nextMuted,
      sfxVolume: get().sfxVolume,
      bgmVolume: get().bgmVolume,
    });
    set({ isMuted: nextMuted });
  },

  setSfxVolume: (vol: number) => {
    const nextVolume = clampVolume(vol, get().sfxVolume);
    AudioService.setSfxVolume(nextVolume);
    saveAudioSettings({
      isMuted: get().isMuted,
      sfxVolume: nextVolume,
      bgmVolume: get().bgmVolume,
    });
    set({ sfxVolume: nextVolume });
  },

  setBgmVolume: (vol: number) => {
    const nextVolume = clampVolume(vol, get().bgmVolume);
    AudioService.setBgmVolume(nextVolume);
    saveAudioSettings({
      isMuted: get().isMuted,
      sfxVolume: get().sfxVolume,
      bgmVolume: nextVolume,
    });
    set({ bgmVolume: nextVolume });
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
