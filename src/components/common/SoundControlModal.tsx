import React from 'react';
import { Volume2, VolumeX, Sliders, X } from 'lucide-react';
import { useAudioStore } from '../../stores/useAudioStore';

interface SoundControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundControlModal: React.FC<SoundControlModalProps> = ({ isOpen, onClose }) => {
  const { isMuted, sfxVolume, bgmVolume, toggleMute, setSfxVolume, setBgmVolume } = useAudioStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-navy-900 border border-gold-500/40 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-gold-300 font-serif font-bold text-base">
            <Sliders className="w-4 h-4 text-gold-400" />
            <span>오디오 환경 설정</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Mute Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-navy-950 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${isMuted ? 'bg-red-950/60 border-red-500/40 text-red-400' : 'bg-gold-500/10 border-gold-500/30 text-gold-400'}`}>
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">마스터 음소거</span>
              <span className="text-[10px] text-slate-400">{isMuted ? '음소거 활성' : '모든 소리 출력 중'}</span>
            </div>
          </div>
          <button
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isMuted ? 'bg-red-600 text-white border-red-500' : 'bg-navy-800 text-slate-300 border-slate-700 hover:border-gold-400'
            }`}
          >
            {isMuted ? '해제' : '음소거'}
          </button>
        </div>

        {/* SFX Volume Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">효과음(SFX) 볼륨</span>
            <span className="text-gold-400 font-mono font-bold">{Math.round(sfxVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={sfxVolume}
            onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
          />
        </div>

        {/* BGM Volume Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">배경음악(BGM) 볼륨</span>
            <span className="text-gold-400 font-mono font-bold">{Math.round(bgmVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={bgmVolume}
            onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-bold text-xs hover:brightness-110"
        >
          설정 완료
        </button>
      </div>
    </div>
  );
};
