import React, { useState } from 'react';
import { X, Lock, CheckCircle2, Trophy, BookOpen, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { useCodexStore } from '../../stores/useCodexStore';
import { useCareerStore } from '../../stores/useCareerStore';
import { RoomTier } from '../../types';
import { ROOM_TIERS_MASTER } from '../../data/roomTiers';

export const CodexModal: React.FC = () => {
  const {
    isCodexModalOpen,
    closeCodexModal,
    activeTab,
    setActiveTab,
    getHydratedItems,
    getHydratedAchievements,
    resetAllData,
  } = useCodexStore();

  const { profile } = useCareerStore();
  const [selectedTierFilter, setSelectedTierFilter] = useState<RoomTier | 'ALL'>('ALL');

  if (!isCodexModalOpen) return null;

  const hydratedItems = getHydratedItems();
  const hydratedAchievements = getHydratedAchievements();
  const unlockedItemCount = hydratedItems.filter((i) => i.isUnlocked).length;
  const unlockedAchCount = hydratedAchievements.filter((a) => a.isUnlocked).length;

  const filteredItems = selectedTierFilter === 'ALL'
    ? hydratedItems
    : hydratedItems.filter((i) => i.item.tier === selectedTierFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-navy-900 border border-gold-500/40 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl shadow-gold-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gold-500/20 bg-navy-950/80">
          <div className="flex min-w-0 items-start gap-3">
            <div className="shrink-0 p-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
              {activeTab === 'ITEMS' ? <BookOpen className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-bold text-slate-100 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                {activeTab === 'ITEMS' ? `소더비 ${hydratedItems.length}종 역사 유물 도감 (Master Codex)` : '영구 업적 및 트로피'}
                <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                  <ShieldCheck className="w-3 h-3" />
                  Career Storage v2.3.1
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                다회차 플레이를 통해 5단계 룸 티어 {hydratedItems.length}종의 보물과 트로피를 수집하세요.
              </p>
            </div>
          </div>

          <button
            onClick={closeCodexModal}
            aria-label="도감 닫기"
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation & Stats Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-navy-950/40 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ITEMS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ITEMS'
                  ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 shadow-md font-bold'
                  : 'bg-navy-800/80 text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              유물 도감 ({unlockedItemCount}/{hydratedItems.length})
            </button>
            <button
              onClick={() => setActiveTab('ACHIEVEMENTS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ACHIEVEMENTS'
                  ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 shadow-md font-bold'
                  : 'bg-navy-800/80 text-slate-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              달성 업적 ({unlockedAchCount}/8)
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div>
              플레이: <span className="text-slate-200 font-bold">{profile.totalGamesPlayed}</span>전
            </div>
            <div>
              승리: <span className="text-gold-400 font-bold">{profile.totalWins}</span>회
            </div>
            <div>
              총 순자산: <span className="text-emerald-400 font-bold">${profile.careerNetWorth.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Sub Filter: Tier Filter for Items */}
        {activeTab === 'ITEMS' && (
          <div
            role="group"
            aria-label="도감 룸 티어 필터"
            className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 py-2 bg-navy-950/60 border-b border-slate-800 text-xs"
          >
            <span className="shrink-0 whitespace-nowrap text-slate-400 font-medium mr-1">룸 티어 필터:</span>
            {(['ALL', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND', 'BLACK_MARKET'] as const).map((tierKey) => {
              const label = tierKey === 'ALL'
                ? `전체 (${hydratedItems.length}종)`
                : `${ROOM_TIERS_MASTER[tierKey].badge} ${ROOM_TIERS_MASTER[tierKey].name}`;
              const isSelected = selectedTierFilter === tierKey;

              return (
                <button
                  key={tierKey}
                  onClick={() => setSelectedTierFilter(tierKey)}
                  className={`shrink-0 whitespace-nowrap px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    isSelected
                      ? 'bg-gold-500/20 border border-gold-400 text-gold-300 shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'ITEMS' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map(({ item, isUnlocked }) => (
                <div
                  key={item.id}
                  className={`relative rounded-xl border p-3 flex flex-col transition-all duration-300 ${
                    isUnlocked
                      ? 'bg-navy-950/90 border-gold-500/40 shadow-lg hover:border-gold-400'
                      : 'bg-navy-950/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  {/* Item Image Container */}
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800 mb-3 group">
                    {isUnlocked ? (
                      <>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 p-1 rounded-full text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                        <Lock className="w-8 h-8 mb-2" />
                        <span className="text-[11px] font-mono tracking-wider">미해금 유물</span>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-navy-950/80 border border-slate-700 text-[10px] text-slate-300 font-medium uppercase flex items-center gap-1">
                      <span>{ROOM_TIERS_MASTER[item.tier || 'BRONZE'].badge}</span>
                      <span>{item.category}</span>
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className={`font-serif text-sm font-bold truncate ${isUnlocked ? 'text-gold-200' : 'text-slate-500'}`}>
                        {isUnlocked ? item.name : '미지의 출품작'}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {isUnlocked ? item.description : '경매에서 직접 낙찰받으면 도감에 영구 소장됩니다.'}
                      </p>
                    </div>

                    {isUnlocked && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">실제 가치</span>
                        <span className="text-emerald-400 font-bold font-mono">
                          ${item.realValue.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hydratedAchievements.map(({ achievement, isUnlocked }) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                    isUnlocked
                      ? 'bg-navy-950/90 border-gold-500/50 shadow-md'
                      : 'bg-navy-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className={`p-2 rounded-2xl border flex-shrink-0 transition-all ${
                    isUnlocked ? 'bg-gold-500/10 border-gold-500/40 shadow-md shadow-gold-500/20' : 'bg-slate-900 border-slate-800'
                  }`}>
                    {achievement.badgeImageUrl ? (
                      <img
                        src={achievement.badgeImageUrl}
                        alt={achievement.title}
                        className={`w-14 h-14 rounded-xl object-contain transition-all ${
                          isUnlocked ? 'scale-105' : 'grayscale opacity-35'
                        }`}
                      />
                    ) : (
                      <div className={`text-3xl p-2 ${isUnlocked ? '' : 'grayscale opacity-35'}`}>
                        {achievement.badge}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-serif text-sm font-bold ${isUnlocked ? 'text-gold-300' : 'text-slate-400'}`}>
                        {achievement.title}
                      </h3>
                      {isUnlocked ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> 달성 완료
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> 미달성
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-navy-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <span>💡 {hydratedItems.length}종 고유 유물과 업적이 영구 보존됩니다.</span>
          </div>
          <button
            onClick={resetAllData}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400 transition-colors"
            title="스토리지 초기화 (테스트용)"
          >
            <RefreshCw className="w-3 h-3" /> 도감 초기화
          </button>
        </div>
      </div>
    </div>
  );
};
