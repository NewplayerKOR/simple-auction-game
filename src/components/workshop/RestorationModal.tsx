import React, { useState } from 'react';
import { Wrench, Sparkles, AlertTriangle, X, CheckCircle2, Hammer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCareerStore } from '../../stores/useCareerStore';
import { RestorationResult } from '../../types';
import { getOwnedCurseCodes, getRestorationProbabilities } from '../../services/contrabandService';

interface RestorationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RestorationModal: React.FC<RestorationModalProps> = ({ isOpen, onClose }) => {
  const { profile, getHydratedVaultItems, attemptRestoration } = useCareerStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RestorationResult | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  if (!isOpen) return null;

  const vaultItems = getHydratedVaultItems();
  const selectedItem = vaultItems.find((item) => item.id === selectedItemId) || vaultItems[0] || null;
  const restorationProbabilities = getRestorationProbabilities(getOwnedCurseCodes(profile.vaultItemIds));

  const handleRestore = () => {
    if (!selectedItem || isRestoring) return;
    const cost = selectedItem.restorationCost || 500;
    if (profile.careerCash < cost) return;

    setIsRestoring(true);
    setLastResult(null);

    setTimeout(() => {
      try {
        const result = attemptRestoration(selectedItem.id);
        setLastResult(result);

        if (result.outcome === 'JACKPOT' || result.outcome === 'SUCCESS') {
          confetti({
            particleCount: result.outcome === 'JACKPOT' ? 120 : 60,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#10B981', '#F59E0B']
          });
        }
      } catch (e) {
        console.error('Restoration failed:', e);
      } finally {
        setIsRestoring(false);
      }
    }, 900);
  };

  const getConditionBadge = (condition: string = 'PRISTINE', isJackpot?: boolean) => {
    if (isJackpot) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono tracking-wide bg-gold-500/20 text-gold-300 border border-gold-400 flex items-center gap-1 shadow-sm animate-pulse">
          💎 잭팟 (200%)
        </span>
      );
    }
    switch (condition) {
      case 'PRISTINE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono tracking-wide bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 완벽 보존 (100%)
          </span>
        );
      case 'DUSTY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono tracking-wide bg-amber-950/80 text-amber-300 border border-amber-500/50 flex items-center gap-1">
            🟡 먼지 쌓임 (80%)
          </span>
        );
      case 'DAMAGED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono tracking-wide bg-orange-950/80 text-orange-300 border border-orange-500/50 flex items-center gap-1">
            🔴 심각한 훼손 (50%)
          </span>
        );
      case 'RUINED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono tracking-wide bg-red-950/90 text-red-400 border border-red-500 flex items-center gap-1">
            💀 영구 훼손 (20%)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-lg animate-fade-in">
      <div 
        className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-navy-950/95 backdrop-blur-xl border border-gold-500/30 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-navy-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shadow-inner">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>소더비 유물 복원 공방 (Restoration)</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-navy-950 border border-slate-700 text-gold-300">
                  보유 현금: ${profile.careerCash.toLocaleString()}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                먼지 쌓이거나 훼손된 유물을 장인의 손길로 복원하여 가치를 회복하세요. (20% 파손 위험)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-navy-900 border border-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Items List / Right Worktable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Vault Items Selector (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-serif font-bold text-gold-300 px-1">
              <span>보관함 소장품 ({vaultItems.length}종)</span>
              <span className="text-[11px] font-sans font-normal text-slate-400">복원할 유물 선택</span>
            </div>

            {vaultItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                보관함에 보유 중인 유물이 없습니다.
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {vaultItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const itemCondition = item.condition || 'PRISTINE';
                  const isJackpot = item.isJackpot;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setLastResult(null);
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex items-center gap-3 active:scale-98 ${
                        isSelected
                          ? 'bg-navy-900 border-gold-400 shadow-md shadow-gold-500/10 scale-[1.01]'
                          : 'bg-navy-950/70 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0 bg-slate-900"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-serif font-bold text-xs text-slate-200 truncate">{item.name}</h4>
                          <span className="font-mono text-xs font-black text-gold-300">${item.realValue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          {getConditionBadge(itemCondition, isJackpot)}
                          <span className="text-[10px] font-mono text-slate-400">비용: ${(item.restorationCost || 500).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Restoration Workbench (7 cols) */}
          <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
            {selectedItem ? (
              <div className="p-5 rounded-3xl bg-navy-900/60 border border-slate-800/80 space-y-4 backdrop-blur-md">
                {/* Result Notification Banner */}
                {lastResult && (
                  <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-bounce-short ${
                    lastResult.outcome === 'JACKPOT'
                      ? 'bg-gold-500/20 border-gold-400 text-gold-200'
                      : lastResult.outcome === 'SUCCESS'
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                      : 'bg-red-950/90 border-red-500 text-red-200'
                  }`}>
                    {lastResult.outcome === 'JACKPOT' ? (
                      <Sparkles className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                    ) : lastResult.outcome === 'SUCCESS' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs space-y-0.5">
                      <p className="font-serif font-bold text-sm">{lastResult.message}</p>
                      <p className="text-[11px] opacity-80 font-sans">
                        상태: {lastResult.previousCondition} ➔ <strong className="font-bold uppercase">{lastResult.newCondition}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Selected Item Big Card */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-gold-500/30 shadow-xl bg-slate-900 flex-shrink-0"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0 text-center sm:text-left">
                    <span className="text-[10px] uppercase font-mono font-bold text-gold-400 tracking-wider">
                      LOT #{selectedItem.id.toUpperCase()} • {selectedItem.tier}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-black text-slate-100">
                      {selectedItem.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 font-sans">
                      {selectedItem.description}
                    </p>
                    <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {getConditionBadge(selectedItem.condition, selectedItem.isJackpot)}
                      <span className="text-xs font-mono font-black text-emerald-400 bg-navy-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                        현재 가치: ${selectedItem.realValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Restoration Probability Table (Apple HIG) */}
                <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800 space-y-2 text-xs font-sans">
                  <span className="font-serif font-bold text-gold-300 block text-xs">복원 시뮬레이션 확률 분포</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
                      <span className="font-mono font-black block text-sm">{Math.round(restorationProbabilities.success * 100)}%</span>
                      <span>원형 복원 성공</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gold-950/50 border border-gold-500/30 text-gold-300">
                      <span className="font-mono font-black block text-sm">{Math.round(restorationProbabilities.jackpot * 100)}%</span>
                      <span>서명 발견 잭팟(2x)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300">
                      <span className="font-mono font-black block text-sm">{Math.round(restorationProbabilities.failed * 100)}%</span>
                      <span>파손 영구 훼손</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleRestore}
                  disabled={
                    isRestoring ||
                    profile.careerCash < (selectedItem.restorationCost || 500) ||
                    (selectedItem.condition === 'PRISTINE' && !selectedItem.isJackpot)
                  }
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-500 to-gold-600 text-navy-950 font-serif font-black text-sm shadow-lg shadow-gold-500/25 transition-all duration-150 ease-out active:scale-95 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Hammer className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                  <span>
                    {isRestoring
                      ? '장인이 정밀 복원 작업 중...'
                      : selectedItem.condition === 'PRISTINE' && !selectedItem.isJackpot
                      ? '이미 완벽한 보존 상태입니다'
                      : profile.careerCash < (selectedItem.restorationCost || 500)
                      ? `복원 비용 부족 ($${(selectedItem.restorationCost || 500).toLocaleString()})`
                      : `유물 복원 시도 ($${(selectedItem.restorationCost || 500).toLocaleString()} 지불)`}
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-navy-900/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                왼쪽 목록에서 복원할 유물을 선택하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
