import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Landmark, BookOpen, RotateCcw, Sparkles, ChevronRight, AlertOctagon } from 'lucide-react';
import { useAuctionStore } from '../../stores/useAuctionStore';
import { useCodexStore } from '../../stores/useCodexStore';
import { useCareerStore } from '../../stores/useCareerStore';
import { MASTER_SYNERGIES } from '../../data/masterSynergies';
import { ROOM_TIERS_MASTER } from '../../data/roomTiers';
import { BankruptcyModal } from '../bankruptcy/BankruptcyModal';

export const ResultGalleryView: React.FC = () => {
  const { settlementSummary, returnToLobby } = useAuctionStore();
  const { openCodexModal } = useCodexStore();
  const { profile } = useCareerStore();
  const [isBankruptcyModalOpen, setIsBankruptcyModalOpen] = useState(false);

  const userRank = settlementSummary?.playerRankings.find((r) => r.player.isHuman);
  const isWinner = userRank?.rank === 1;

  useEffect(() => {
    // 승리 시 화려한 골드 컨페티 발사
    if (isWinner) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FAF4E6', '#F4E4BD', '#94721D', '#10B981'],
      });
    }

  }, [isWinner]);

  if (!settlementSummary || !userRank) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">정산 결과를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 완성된 세트 시너지 목록 확인
  const userItemIds = new Set(userRank.player.inventory.map((i) => i.id));
  const completedSynergies = MASTER_SYNERGIES.filter((syn) =>
    syn.requiredItemIds.every((id) => userItemIds.has(id))
  );

  const promotedConfig = settlementSummary.promotedTier
    ? ROOM_TIERS_MASTER[settlementSummary.promotedTier]
    : null;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative selection:bg-gold-500 selection:text-navy-950"
      style={{ backgroundImage: `url('/assets/images/backgrounds/bg_museum_gallery.webp')` }}
    >
      {/* Dark Luxury Overlay */}
      <div className="absolute inset-0 bg-navy-950/85 backdrop-blur-[3px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Bankruptcy Warning Banner (if Bankrupt at end of game) */}
        {profile.isBankrupt && (
          <div className="p-5 rounded-3xl bg-red-950/85 backdrop-blur-md border-2 border-red-500/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce-short">
            <div className="flex items-center gap-3 text-red-200">
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-red-100 flex items-center gap-2">
                  <span>💸 파산 선고: 최종 손실로 인한 자금 고갈</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-900 border border-red-400/30 text-red-300">
                    순자산 &lt; $1,000
                  </span>
                </h3>
                <p className="text-xs text-red-300/80 font-sans">
                  위작 피해 및 과열 지출로 인해 총 자산이 파산 기준치 미만으로 폭락했습니다.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsBankruptcyModalOpen(true)}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-red-500/30 transition-all duration-150 ease-out active:scale-95 hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              <span>파산 신청 &amp; $5,000 긴급 구제</span>
            </button>
          </div>
        )}

        {/* Ceremony Header Banner (Apple HIG Frosted Glass) */}
        <div className="text-center py-8 px-6 rounded-3xl bg-navy-950/75 border border-gold-500/30 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-serif font-bold">
              <Trophy className="w-4 h-4 text-gold-400" />
              FINAL AUCTION CEREMONY &amp; SETTLEMENT
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500">
              {isWinner ? '🏆 소더비 그랜드 챔피언 등극!' : '🏛️ 소더비 경매 시상식 완료'}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {settlementSummary.userEarnedTitles.map((title) => (
                <span key={title} className="px-3.5 py-1 rounded-full bg-gold-500/20 border border-gold-400 text-gold-300 text-xs font-bold font-serif flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" /> 칭호: {title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Room Tier Promotion Banner (승급 알림) */}
        {promotedConfig && !profile.isBankrupt && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-navy-900 to-gold-950/80 border-2 border-gold-400 space-y-2 shadow-2xl backdrop-blur-md animate-bounce-short text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{promotedConfig.badge}</span>
              <div>
                <span className="text-xs font-mono font-black text-gold-400 uppercase tracking-widest block">
                  🎉 NEW ROOM UNLOCKED!
                </span>
                <h3 className="font-serif text-xl font-black text-slate-100">
                  {promotedConfig.name} 경매장 해금 완료!
                </h3>
                <p className="text-xs text-slate-300 font-sans">
                  총 순자산이 기준치를 돌파하여 상위 룸에 입장할 수 있습니다.
                </p>
              </div>
            </div>
            <button
              onClick={returnToLobby}
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all duration-150 ease-out shadow-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>새로운 룸 도전</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Newly Unlocked Achievements Highlight */}
        {settlementSummary.newlyUnlockedAchievementIds.length > 0 && (
          <div className="p-6 rounded-3xl bg-emerald-950/60 border border-emerald-500/40 space-y-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-400 font-serif font-bold text-sm">
              <Trophy className="w-4 h-4 text-gold-400" />
              <span>🎉 축하합니다! 이번 게임에서 신규 영구 업적을 달성했습니다!</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {settlementSummary.newlyUnlockedAchievementIds.map((achId) => {
                const ach = useCodexStore.getState().getHydratedAchievements().find((a) => a.achievement.id === achId)?.achievement;
                if (!ach) return null;
                return (
                  <div key={achId} className="p-4 rounded-2xl bg-navy-950/90 border border-gold-500/40 flex items-center gap-3 shadow-md">
                    {ach.badgeImageUrl ? (
                      <img
                        src={ach.badgeImageUrl}
                        alt={ach.title}
                        className="w-12 h-12 rounded-xl object-contain border border-gold-500/40 shadow-sm"
                      />
                    ) : (
                      <span className="text-2xl">{ach.badge}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif text-xs font-bold text-gold-300 truncate">{ach.title}</h4>
                      <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-1 font-sans">{ach.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Final Net Worth Leaderboard (Apple HIG Monospace Numbers) */}
        <div className="bg-navy-950/75 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-gold-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-400" /> 이번 매치 순자산(Net Worth) 순위표
            </h2>
            <div className="text-xs font-mono text-slate-300">
              영구 누적 총 순자산: <strong className="text-gold-300 font-black text-sm">${profile.careerNetWorth.toLocaleString()}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">순위</th>
                  <th className="py-3 px-4">참가자</th>
                  <th className="py-3 px-4 text-right">보유 현금</th>
                  <th className="py-3 px-4 text-right">소장품 가치</th>
                  <th className="py-3 px-4 text-right">시너지 보너스</th>
                  <th className="py-3 px-4 text-right">대출 상환</th>
                  <th className="py-3 px-4 text-right text-gold-300 font-black">최종 순자산</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {settlementSummary.playerRankings.map((r) => {
                  const isMe = r.player.isHuman;
                  return (
                    <tr
                      key={r.player.id}
                      className={`transition-colors ${
                        isMe ? 'bg-gold-500/10 font-bold' : 'hover:bg-navy-900/40 text-slate-300'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-serif text-sm">
                        {r.rank === 1 ? '🥇 1위' : r.rank === 2 ? '🥈 2위' : r.rank === 3 ? '🥉 3위' : `${r.rank}위`}
                      </td>
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={r.player.avatar}
                          alt={r.player.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-slate-700 shadow-sm"
                        />
                        <span className={isMe ? 'text-gold-200 font-sans font-bold' : 'font-sans'}>
                          {r.player.name} {isMe && '(나)'}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right ${r.cash < 0 ? 'text-red-400 font-black' : 'text-slate-200 font-bold'}`}>
                        ${r.cash.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-200 font-bold">${r.inventoryTotalValue.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                        {r.synergyBonusValue > 0 ? `+$${r.synergyBonusValue.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-red-400 font-bold">
                        {r.loanDeduction > 0 ? `-$${r.loanDeduction.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-black text-sm sm:text-base">
                        ${r.finalNetWorth.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Completed Synergy Sets Notice */}
        {completedSynergies.length > 0 && (
          <div className="p-6 rounded-3xl bg-navy-950/75 border border-gold-500/30 space-y-2 backdrop-blur-md">
            <div className="flex items-center gap-2 text-gold-300 font-serif font-bold text-sm">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>특수 컬렉션 시너지 세트 완성 보너스 발동!</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {completedSynergies.map((syn) => (
                <div key={syn.id} className="p-3.5 rounded-2xl bg-navy-900/80 border border-gold-500/30 text-xs shadow-md">
                  <span className="font-bold text-gold-200 block">{syn.name}</span>
                  <p className="text-slate-300 text-[11px] mt-1 font-sans">{syn.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Collection Room (나만의 전시관) */}
        <div className="bg-navy-950/75 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-gold-200 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-gold-400" /> 나의 경매 획득 컬렉션 진열장
              </h2>
              <p className="text-xs text-slate-400 font-sans">이번 게임에서 성공적으로 낙찰받은 역사적 유물들입니다.</p>
            </div>
            <span className="text-xs font-mono font-bold text-gold-300 bg-navy-900 px-3.5 py-1.5 rounded-full border border-slate-800">
              총 {userRank.player.inventory.length}개 소장
            </span>
          </div>

          {userRank.player.inventory.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500 text-xs font-sans">이번 게임에서 낙찰받은 물품이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userRank.player.inventory.map((item, idx) => (
                <div
                  key={`${item.id}_${idx}`}
                  className="bg-navy-900/80 border border-gold-500/30 rounded-3xl p-4 flex flex-col justify-between space-y-3 shadow-xl hover:border-gold-400 transition-all group"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Stamp Overlays in Museum Room */}
                    {item.isFake ? (
                      <div className="absolute inset-0 bg-red-950/60 flex items-center justify-center p-2">
                        <img
                          src="/assets/images/ui/stamp_fake.webp"
                          alt="위작"
                          className="w-24 h-24 object-contain drop-shadow-xl -rotate-12"
                        />
                      </div>
                    ) : (
                      <div className="absolute bottom-2 right-2">
                        <img
                          src="/assets/images/ui/stamp_genuine.webp"
                          alt="진품"
                          className="w-14 h-14 object-contain drop-shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-gold-400">{item.category}</span>
                    <h3 className="font-serif text-sm font-bold text-slate-200 truncate">{item.name}</h3>
                    <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-800">
                      <span className="text-slate-400">최종 가치</span>
                      <span className={`font-mono font-black ${item.isFake ? 'text-red-400' : 'text-emerald-400'}`}>
                        ${item.realValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Action Controls (Apple HIG 48px tactile buttons) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <button
            onClick={() => openCodexModal('ITEMS')}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-2xl bg-navy-900 border border-gold-500/40 text-gold-300 hover:text-white hover:border-gold-400 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-150 ease-out active:scale-95 shadow-md cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>영구 도감 &amp; 업적 확인하기</span>
          </button>

          <button
            onClick={returnToLobby}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-serif font-black text-xs hover:brightness-110 active:scale-95 transition-all duration-150 ease-out shadow-xl shadow-gold-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>새로운 경매 시작하기 (로비)</span>
          </button>
        </div>
      </div>

      {/* Bankruptcy Modal Integration */}
      <BankruptcyModal 
        isOpen={isBankruptcyModalOpen} 
        onClose={() => setIsBankruptcyModalOpen(false)} 
      />
    </div>
  );
};

