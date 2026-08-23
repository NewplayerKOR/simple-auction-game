import React, { useState } from 'react';
import { Play, Sparkles, Lock, Landmark, ShieldAlert, BookOpen, RotateCcw, AlertOctagon, Wrench, Store, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuctionStore } from '../../stores/useAuctionStore';
import { useCareerStore } from '../../stores/useCareerStore';
import { useCodexStore } from '../../stores/useCodexStore';
import { RoomTier, AuctionMode, ItemCategory } from '../../types';
import { ROOM_TIERS_MASTER, ROOM_TIER_ORDER } from '../../data/roomTiers';
import { BankruptcyModal } from '../bankruptcy/BankruptcyModal';
import { RestorationModal } from '../workshop/RestorationModal';
import { ConsignmentModal } from '../consignment/ConsignmentModal';
import { MASTER_ITEMS } from '../../data/masterItems';

export const LobbyView: React.FC = () => {
  const { startNewGame } = useAuctionStore();
  const { profile, marketRates, enterRoom, resetCareer } = useCareerStore();
  const { openCodexModal } = useCodexStore();

  const [selectedTier, setSelectedTier] = useState<RoomTier>('BRONZE');
  const [selectedMode, setSelectedMode] = useState<AuctionMode>('ENGLISH');
  const [entryError, setEntryError] = useState<string | null>(null);
  const [isBankruptcyModalOpen, setIsBankruptcyModalOpen] = useState(false);
  const [isRestorationModalOpen, setIsRestorationModalOpen] = useState(false);
  const [isConsignmentModalOpen, setIsConsignmentModalOpen] = useState(false);

  const handleEnterRoom = (tier: RoomTier) => {
    if (profile.isBankrupt) {
      setIsBankruptcyModalOpen(true);
      return;
    }
    setEntryError(null);
    const success = enterRoom(tier);
    if (!success) {
      const config = ROOM_TIERS_MASTER[tier];
      if (profile.careerNetWorth < config.minNetWorthRequired) {
        setEntryError(`순자산 $${config.minNetWorthRequired.toLocaleString()} 이상이어야 해금됩니다.`);
      } else if (profile.careerCash < config.entryFee) {
        setEntryError(`입장료 $${config.entryFee.toLocaleString()}가 부족합니다.`);
      }
      return;
    }
    startNewGame(tier, selectedMode);
  };

  const categoryIcons: Record<ItemCategory, { label: string; icon: string }> = {
    PAINTING: { label: '회화', icon: '🎨' },
    ANTIQUE: { label: '골동품', icon: '🏺' },
    JEWELRY: { label: '보석', icon: '💎' }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative selection:bg-gold-500 selection:text-navy-950"
      style={{ backgroundImage: `url('/assets/images/backgrounds/bg_lobby.webp')` }}
    >
      <div className="absolute inset-0 bg-navy-950/85 backdrop-blur-[3px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Live Market Rates Strip */}
        <div className="p-4 rounded-3xl bg-navy-950/80 backdrop-blur-md border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs font-serif font-bold text-slate-200">
            <span className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <span>글로벌 실시간 시세 변동</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto">
            {(Object.keys(marketRates.rates) as ItemCategory[]).map((cat) => {
              const info = marketRates.rates[cat];
              const isPump = info.trend === 'PUMP';
              const isDump = info.trend === 'DUMP';
              const percent = info.multiplier >= 1 ? `+${Math.round((info.multiplier - 1) * 100)}%` : `-${Math.round((1 - info.multiplier) * 100)}%`;

              return (
                <div
                  key={cat}
                  onClick={() => setIsConsignmentModalOpen(true)}
                  className={`px-3 py-2 rounded-2xl border flex items-center justify-between gap-2 cursor-pointer transition-all duration-150 active:scale-95 ${
                    isPump
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-950/90'
                      : isDump
                      ? 'bg-red-950/60 border-red-500/50 text-red-300 hover:bg-red-950/90'
                      : 'bg-navy-900/80 border-slate-800 text-slate-300 hover:bg-navy-900'
                  }`}
                  title={info.newsHeadline}
                >
                  <span className="text-xs font-serif font-bold flex items-center gap-1">
                    {categoryIcons[cat].icon} <span className="hidden sm:inline">{categoryIcons[cat].label}</span>
                  </span>
                  <span className="text-xs font-mono font-black tracking-tight flex items-center">
                    {isPump && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
                    {isDump && <ArrowDownRight className="w-3 h-3 text-red-400" />}
                    {info.multiplier}x ({percent})
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setIsConsignmentModalOpen(true)}
            className="w-full md:w-auto min-h-[40px] px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 text-xs font-serif font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Store className="w-3.5 h-3.5" />
            <span>위탁 리셀 마켓 열기</span>
          </button>
        </div>

        {profile.isBankrupt && (
          <div className="p-4 sm:p-5 rounded-3xl bg-red-950/80 backdrop-blur-md border-2 border-red-500/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3 text-red-200">
              <div className="p-2.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-red-100 flex items-center gap-2">
                  <span>자금 고갈 및 파산 상태</span>
                  <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-red-900/60 border border-red-400/30 text-red-300">
                    현금 &lt; $500
                  </span>
                </h3>
                <p className="text-xs text-red-300/80 font-sans">
                  경매에 참가할 수 있는 최소 자본금이 고갈되었습니다. 신용 회복 구제 프로그램을 신청하세요.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsBankruptcyModalOpen(true)}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-red-500/30 transition-all duration-150 ease-out active:scale-95 hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>파산 신청 &amp; $5,000 구제 자금 받기</span>
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8 rounded-3xl bg-navy-950/75 backdrop-blur-md border border-gold-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="relative">
                <img src="/assets/images/avatars/avatar_user.webp" alt="플레이어 아바타" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-gold-400 shadow-xl shadow-gold-500/20" />
                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-gold-500 text-navy-950 text-[10px] font-black uppercase shadow-md font-mono">
                  {ROOM_TIERS_MASTER[profile.highestRoomTierUnlocked].badge} {profile.highestRoomTierUnlocked}
                </span>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-[11px] font-bold mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" /> 소더비 영구 커리어 컬렉터
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-100 tracking-wide">
                  나만의 옥션 커리어 프로필
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans">
                  총 <span className="font-mono font-bold text-slate-200">{profile.totalGamesPlayed}</span>전 <span className="font-mono font-bold text-gold-400">{profile.totalWins}</span>승 | 소장품 <span className="font-mono font-bold text-slate-200">{profile.vaultItemIds.length}</span>/{MASTER_ITEMS.length}종 보관
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
              <div className="px-5 py-3.5 rounded-2xl bg-navy-900/80 border border-slate-700/80 shadow-md text-center md:text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">보유 가용 현금</span>
                <span className={`font-mono text-xl sm:text-2xl font-black tracking-tight ${profile.careerCash < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  ${profile.careerCash.toLocaleString()}
                </span>
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-gold-950/40 border border-gold-500/40 shadow-md text-center md:text-right">
                <span className="text-[10px] font-mono text-gold-300 block uppercase tracking-wider">총 순자산 (Net Worth)</span>
                <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-gold-300">
                  ${profile.careerNetWorth.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-navy-950/75 border border-slate-800 backdrop-blur-md">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-xs font-serif font-bold text-gold-300">경매 진행 방식 선택</span>
            <p className="text-xs text-slate-400 font-sans">
              {selectedMode === 'ENGLISH' ? '🏛️ 잉글리시 호가 경매: 호가를 올려 최고가 1인이 낙찰' : '📉 더치 역경매: 초당 가격이 하락하며 먼저 누른 1인이 즉시 낙찰!'}
            </p>
          </div>
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-navy-900 border border-slate-800 w-full sm:w-auto">
            <button onClick={() => setSelectedMode('ENGLISH')} className={`flex-1 sm:flex-none min-h-[48px] px-5 py-2.5 rounded-xl text-xs font-serif font-bold transition-all duration-150 active:scale-95 cursor-pointer ${selectedMode === 'ENGLISH' ? 'bg-gold-500 text-navy-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>🏛️ 잉글리시</button>
            <button onClick={() => setSelectedMode('DUTCH')} className={`flex-1 sm:flex-none min-h-[48px] px-5 py-2.5 rounded-xl text-xs font-serif font-bold transition-all duration-150 active:scale-95 cursor-pointer ${selectedMode === 'DUTCH' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}>📉 더치</button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gold-200 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-gold-400" /> 5단계 경매장 &amp; 자정의 비밀 암시장
            </h2>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300">
                🎟️ 블랙 VIP 티켓: <strong className="text-purple-200 font-black">{profile.blackVipTicketCount || 0}</strong>장
              </span>
              {entryError && <div className="px-3.5 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-serif flex items-center gap-2 animate-bounce-short"><ShieldAlert className="w-4 h-4 text-red-400" /><span>{entryError}</span></div>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {ROOM_TIER_ORDER.map((tier) => {
              const conf = ROOM_TIERS_MASTER[tier];
              const isBlackMarket = tier === 'BLACK_MARKET';
              const isUnlocked = isBlackMarket
                ? profile.careerNetWorth >= conf.minNetWorthRequired || (profile.blackVipTicketCount || 0) >= 1
                : profile.careerNetWorth >= conf.minNetWorthRequired;
              const canAffordFee = profile.careerCash >= conf.entryFee;
              const isSelected = selectedTier === tier;

              return (
                <div
                  key={tier}
                  onClick={() => { setSelectedTier(tier); setEntryError(null); }}
                  className={`relative rounded-3xl p-5 border-2 backdrop-blur-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-xl ${
                    isSelected
                      ? isBlackMarket
                        ? 'bg-purple-950/95 border-purple-400 shadow-2xl shadow-purple-500/30 scale-[1.02]'
                        : 'bg-navy-950/95 border-gold-400 shadow-2xl shadow-gold-500/20 scale-[1.02]'
                      : isUnlocked
                      ? isBlackMarket
                        ? 'bg-purple-950/40 border-purple-500/40 hover:border-purple-400'
                        : 'bg-navy-950/70 border-slate-800/80 hover:border-gold-500/40'
                      : 'bg-navy-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{conf.badge}</span>
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300">
                        입장료: ${conf.entryFee.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
                      <span>{conf.name}</span>
                      {!isUnlocked && <Lock className="w-4 h-4 text-slate-500" />}
                    </h3>
                    <p className={`text-xs font-medium mt-0.5 ${isBlackMarket ? 'text-purple-400' : 'text-gold-400/90'}`}>
                      {conf.subtitle}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-sans">
                      {conf.description}
                    </p>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-slate-800/80">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">최소 순자산</span>
                      <span className={`font-bold ${isUnlocked ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${conf.minNetWorthRequired.toLocaleString()}
                      </span>
                    </div>
                    {isBlackMarket && (
                      <div className="flex justify-between items-center text-[11px] font-mono text-purple-300">
                        <span>또는 VIP 티켓</span>
                        <span className="font-bold">1장 소모</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">봇 자금력</span>
                      <span className="text-gold-300 font-bold">
                        ${conf.botStartingCashRange[0].toLocaleString()} ~ ${conf.botStartingCashRange[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEnterRoom(tier); }}
                    disabled={!isUnlocked || !canAffordFee || profile.isBankrupt}
                    className={`w-full min-h-[48px] py-3 px-4 rounded-2xl text-xs font-serif font-bold transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                      !isUnlocked
                        ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
                        : !canAffordFee
                        ? 'bg-red-950/80 border border-red-500/50 text-red-300 cursor-not-allowed'
                        : profile.isBankrupt
                        ? 'bg-red-900 text-red-200'
                        : isSelected
                        ? isBlackMarket
                          ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white'
                          : 'bg-gold-500 text-navy-950'
                        : 'bg-navy-800'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> {!isUnlocked ? '입장 불가' : !canAffordFee ? '자금 부족' : '경매장 입장하기'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-navy-950/75 border border-slate-800/80 backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-400 flex-shrink-0"><BookOpen className="w-5 h-5" /></div>
            <div className="space-y-0.5">
              <h3 className="font-serif text-sm sm:text-base font-bold text-slate-200">{MASTER_ITEMS.length}종 역사 유물 영구 도감 &amp; 보관함</h3>
              <p className="text-xs text-slate-400 font-sans">현재 <span className="font-mono font-bold text-slate-200">{profile.vaultItemIds.length}</span>/{MASTER_ITEMS.length}종 보유 중</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button onClick={() => setIsRestorationModalOpen(true)} className="flex-1 sm:flex-none min-h-[48px] px-5 py-3 rounded-2xl bg-navy-900 border border-amber-500/40 text-amber-300 hover:border-amber-400 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"><Wrench className="w-4 h-4 text-amber-400" /><span>유물 복원 공방</span></button>
            <button onClick={() => setIsConsignmentModalOpen(true)} className="flex-1 sm:flex-none min-h-[48px] px-5 py-3 rounded-2xl bg-navy-900 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"><Store className="w-4 h-4 text-emerald-400" /><span>위탁 리셀 마켓</span></button>
            <button onClick={() => openCodexModal('ITEMS')} className="flex-1 sm:flex-none min-h-[48px] px-5 py-3 rounded-2xl bg-navy-900 border border-gold-500/30 text-gold-300 hover:border-gold-400 text-xs font-bold transition-all active:scale-95">도감 &amp; 업적 열기</button>
            <button onClick={resetCareer} className="min-h-[48px] px-4 py-3 rounded-2xl bg-navy-900 border border-slate-800 text-slate-500 hover:text-red-400 text-xs font-mono transition-all active:scale-95"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <RestorationModal isOpen={isRestorationModalOpen} onClose={() => setIsRestorationModalOpen(false)} />
      <ConsignmentModal isOpen={isConsignmentModalOpen} onClose={() => setIsConsignmentModalOpen(false)} />
      <BankruptcyModal isOpen={isBankruptcyModalOpen} onClose={() => setIsBankruptcyModalOpen(false)} />
    </div>
  );
};

