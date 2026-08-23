import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, Trophy, Home, Sliders } from 'lucide-react';
import { useAudioStore } from '../../stores/useAudioStore';
import { useCodexStore } from '../../stores/useCodexStore';
import { useAuctionStore } from '../../stores/useAuctionStore';
import { useCareerStore } from '../../stores/useCareerStore';
import { MASTER_ITEMS } from '../../data/masterItems';
import { ROOM_TIERS_MASTER } from '../../data/roomTiers';
import { SoundControlModal } from './SoundControlModal';

export const Header: React.FC = () => {
  const { isMuted, toggleMute } = useAudioStore();
  const { openCodexModal } = useCodexStore();
  const { profile } = useCareerStore();
  const { currentView, currentRound, totalRounds, returnToLobby, players, currentTier, auctionMode } = useAuctionStore();
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);

  const userPlayer = players.find((p) => p.isHuman);
  const tierConfig = ROOM_TIERS_MASTER[currentTier];

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur-md border-b border-gold-500/20 px-4 lg:px-8 py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div 
            onClick={returnToLobby}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 via-gold-600 to-gold-800 p-[1px] shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-all">
              <div className="w-full h-full bg-navy-950 rounded-lg flex items-center justify-center">
                <span className="font-serif font-black text-xl text-gold-400">S</span>
              </div>
            </div>
            <div>
              <h1 className="font-serif tracking-widest text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-gold-600">
                SOTHEBY'S ROYALE
              </h1>
              <p className="text-[11px] text-slate-400 tracking-wider font-sans">
                HIGH-STAKES AUCTION SIMULATOR
              </p>
            </div>
          </div>

          {/* Center Game Status Badge (During Auction) */}
          {currentView === 'AUCTION' && (
            <div className="hidden md:flex items-center gap-4 bg-navy-900/90 border border-gold-500/30 px-5 py-1.5 rounded-full shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 font-bold border border-gold-500/30">
                  {tierConfig.badge} {tierConfig.name}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {auctionMode === 'DUTCH' ? '⚡ 더치 역경매' : '🏛️ 잉글리시'}
                </span>
                <span className="text-xs text-gold-400/80 uppercase tracking-wider font-semibold ml-2">ROUND</span>
                <span className="font-serif font-bold text-gold-300 text-base">{currentRound} / {totalRounds}</span>
              </div>
              {userPlayer && (
                <div className="border-l border-gold-500/20 pl-4 flex items-center gap-2.5">
                  <img
                    src={userPlayer.avatar}
                    alt={userPlayer.name}
                    className="w-6 h-6 rounded-full object-cover border border-gold-400/60 shadow-sm"
                  />
                  <span className="text-xs text-slate-400">가용 현금:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">
                    ${userPlayer.cash.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Right Navigation & Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 영구 도감 버튼 */}
            <button
              onClick={() => openCodexModal('ITEMS')}
              className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-2xl bg-navy-900/90 border border-gold-500/30 hover:border-gold-400 text-slate-200 hover:text-gold-300 transition-all duration-150 ease-out active:scale-95 text-xs font-bold shadow-sm cursor-pointer"
              title="영구 유물 도감"
            >
              <BookOpen className="w-4 h-4 text-gold-400" />
              <span className="hidden sm:inline">영구 도감</span>
              <span className="bg-gold-500/20 text-gold-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full font-black">
                {profile.vaultItemIds.length}/{MASTER_ITEMS.length}
              </span>
            </button>

            {/* 영구 업적 버튼 */}
            <button
              onClick={() => openCodexModal('ACHIEVEMENTS')}
              className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-2xl bg-navy-900/90 border border-gold-500/30 hover:border-gold-400 text-slate-200 hover:text-gold-300 transition-all duration-150 ease-out active:scale-95 text-xs font-bold shadow-sm cursor-pointer"
              title="영구 업적"
            >
              <Trophy className="w-4 h-4 text-gold-400" />
              <span className="hidden sm:inline">업적</span>
              <span className="bg-gold-500/20 text-gold-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full font-black">
                {profile.unlockedAchievementIds.length}/8
              </span>
            </button>

            {/* 사운드 제어 모달 버튼 */}
            <button
              onClick={() => setIsSoundModalOpen(true)}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-2xl bg-navy-900/90 border border-gold-500/30 text-gold-400 hover:border-gold-400 hover:bg-navy-800 transition-all duration-150 ease-out active:scale-95 flex items-center justify-center cursor-pointer"
              title="오디오 환경 설정"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* 퀵 음소거 토글 */}
            <button
              onClick={toggleMute}
              className={`min-h-[44px] min-w-[44px] p-2.5 rounded-2xl border transition-all duration-150 ease-out active:scale-95 flex items-center justify-center cursor-pointer ${
                isMuted
                  ? 'bg-red-950/40 border-red-500/40 text-red-400 hover:bg-red-900/50'
                  : 'bg-navy-900/90 border-gold-500/30 text-gold-400 hover:border-gold-400 hover:bg-navy-800'
              }`}
              title={isMuted ? '음소거 해제' : '음소거'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* 로비 버튼 */}
            {currentView !== 'LOBBY' && (
              <button
                onClick={returnToLobby}
                className="min-h-[44px] min-w-[44px] p-2.5 rounded-2xl bg-navy-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-all duration-150 ease-out active:scale-95 flex items-center justify-center cursor-pointer"
                title="로비로 돌아가기"
              >
                <Home className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sound Settings Modal */}
      <SoundControlModal isOpen={isSoundModalOpen} onClose={() => setIsSoundModalOpen(false)} />
    </>
  );
};
