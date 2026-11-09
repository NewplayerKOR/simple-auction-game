import React, { useState } from 'react';
import { DollarSign, X, CheckCircle2, ArrowUpRight, ArrowDownRight, Store } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCareerStore } from '../../stores/useCareerStore';
import { Item, ItemCategory } from '../../types';
import { MASTER_ITEMS } from '../../data/masterItems';
import { calculateConsignmentPayout } from '../../services/itemValueService';
import { getOwnedCurseCodes } from '../../services/contrabandService';
import { assetSrcSet, assetVariant } from '../../services/assetService';
import { getItemLotLabel } from '../../services/itemDisplayService';
import { prefersReducedMotion } from '../../services/motionService';
import { AssetImage } from '../common/AssetImage';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useModalA11y } from '../../hooks/useModalA11y';

interface ConsignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsignmentModal: React.FC<ConsignmentModalProps> = ({ isOpen, onClose }) => {
  const { profile, marketRates, getHydratedVaultItems, sellConsignmentItem } = useCareerStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [soldMessage, setSoldMessage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen && !isConfirmOpen, onClose);

  if (!isOpen) return null;

  const vaultItems = getHydratedVaultItems();
  const selectedItem = vaultItems.find((item) => item.id === selectedItemId) || vaultItems[0] || null;
  const selectedMaster = selectedItem
    ? MASTER_ITEMS.find((master) => master.id === selectedItem.id) ?? selectedItem
    : null;
  const selectedBaseValue = selectedMaster?.realValue ?? 0;
  const selectedAdjustedValue = selectedItem?.realValue ?? 0;

  // QD-06: UI 미리보기와 store 정산이 같은 단일 계산 함수를 사용한다.
  const calculatePayout = (item: Item) => {
    const masterItem = MASTER_ITEMS.find((master) => master.id === item.id) ?? item;
    const itemState = profile.vaultItemStates?.[item.id];
    return calculateConsignmentPayout(
      masterItem,
      itemState,
      marketRates,
      getOwnedCurseCodes(profile.vaultItemIds)
    );
  };
  const selectedPayout = selectedItem ? calculatePayout(selectedItem) : 0;

  const handleSell = () => {
    if (!selectedItem) return;
    try {
      const { payout } = sellConsignmentItem(selectedItem.id);
      setSoldMessage(`🎉 ${selectedItem.name}을(를) $${payout.toLocaleString()}에 성공적으로 위탁 매각했습니다!`);

      if (!prefersReducedMotion()) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#D4AF37', '#60A5FA']
        });
      }

      setSelectedItemId(null);
    } catch (e) {
      console.error('Consignment sale failed:', e);
    }
  };

  const categoryLabels: Record<ItemCategory, { label: string; icon: string }> = {
    PAINTING: { label: '회화 (PAINTING)', icon: '🎨' },
    ANTIQUE: { label: '골동품 (ANTIQUE)', icon: '🏺' },
    JEWELRY: { label: '보석 (JEWELRY)', icon: '💎' }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-lg animate-fade-in">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="consignment-modal-title"
          aria-hidden={isConfirmOpen || undefined}
          tabIndex={-1}
          className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-navy-950/95 backdrop-blur-xl border border-gold-500/30 shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-navy-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 id="consignment-modal-title" className="font-serif text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                  <span>글로벌 위탁 리셀 마켓 (Consignment)</span>
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-navy-950 border border-slate-700 text-emerald-300">
                    보유 현금: ${profile.careerCash.toLocaleString()}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  매 판마다 급등락(-60% ~ +300%)하는 글로벌 시세 타이밍에 유물을 최고가에 매각하세요.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="위탁 리셀 마켓 닫기"
              className="min-h-[44px] min-w-[44px] rounded-2xl bg-navy-900 border border-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Live Market Rates Ticker Dashboard */}
        <div className="p-4 bg-navy-900/40 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(marketRates.rates) as ItemCategory[]).map((cat) => {
            const info = marketRates.rates[cat];
            const isPump = info.trend === 'PUMP';
            const isDump = info.trend === 'DUMP';
            const percent = info.multiplier >= 1 ? `+${Math.round((info.multiplier - 1) * 100)}%` : `-${Math.round((1 - info.multiplier) * 100)}%`;

            return (
              <div
                key={cat}
                className={`p-3 rounded-2xl border flex items-center justify-between backdrop-blur-md ${
                  isPump
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : isDump
                    ? 'bg-red-950/60 border-red-500/40 text-red-300'
                    : 'bg-navy-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-serif font-bold">
                    <span>{categoryLabels[cat].icon}</span>
                    <span>{categoryLabels[cat].label}</span>
                  </div>
                  <p className="text-[10px] opacity-75 font-mono truncate max-w-[180px] mt-0.5">{info.newsHeadline}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-black tracking-tight flex items-center gap-0.5 justify-end">
                    {isPump && <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
                    {isDump && <ArrowDownRight className="w-4 h-4 text-red-400" />}
                    {info.multiplier}x
                  </span>
                  <span className="text-[10px] font-mono font-bold block">{percent}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Body: Left Vault Items / Right Sell Preview */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Vault Items Selector (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-serif font-bold text-gold-300 px-1">
              <span>보관함 소장품 ({vaultItems.length}종)</span>
              <span className="text-[11px] font-sans font-normal text-slate-400">매각할 유물 선택</span>
            </div>

            {vaultItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                매각할 수 있는 소장품이 없습니다. 경매에 참가하여 유물을 수집하세요.
              </div>
            ) : (
              <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                {vaultItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const payout = calculatePayout(item);
                  const rate = marketRates.rates[item.category]?.multiplier ?? 1.0;

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setSoldMessage(null);
                      }}
                      aria-pressed={isSelected}
                      className={`w-full text-left p-3 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex items-center gap-3 active:scale-98 ${
                        isSelected
                          ? 'bg-navy-900 border-emerald-400 shadow-md shadow-emerald-500/10 scale-[1.01]'
                          : 'bg-navy-950/70 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <AssetImage
                        src={assetVariant(item.imageUrl, '-256')}
                        width={256}
                        height={256}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0 bg-slate-900"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-serif font-bold text-xs text-slate-200 truncate block">{item.name}</span>
                          <span className="font-mono text-xs font-black text-emerald-300">${payout.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>시세 배율: {rate}x</span>
                          <span>상태 반영가: ${item.realValue.toLocaleString()}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Sell Confirmation Desk (7 cols) */}
          <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
            {selectedItem ? (
              <div className="p-5 rounded-3xl bg-navy-900/60 border border-slate-800/80 space-y-4 backdrop-blur-md">
                {soldMessage && (
                  <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 flex items-center gap-2.5 text-xs font-serif font-bold animate-bounce-short">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{soldMessage}</span>
                  </div>
                )}

                {/* Selected Item Big Card */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <AssetImage
                    src={selectedItem.imageUrl}
                    srcSet={assetSrcSet(selectedItem.imageUrl, 512, '-256', 256)}
                    sizes="(min-width: 640px) 112px, 96px"
                    width={512}
                    height={512}
                    alt={selectedItem.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-xl bg-slate-900 flex-shrink-0"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0 text-center sm:text-left">
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                      {selectedItem.category} • {getItemLotLabel(selectedItem.id)}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-black text-slate-100">
                      {selectedItem.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 font-sans">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>

                {/* Pricing Breakdown Card */}
                <div className="p-4 rounded-2xl bg-navy-950/80 border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>유물 기본 실제 가치</span>
                    <span>${selectedBaseValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>보존 상태 반영 가치</span>
                    <span>${selectedAdjustedValue.toLocaleString()} ({(selectedItem.conditionMultiplier ?? 1.0) * 100}%)</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400 font-bold">
                    <span>현재 시장 시세 승수 ({selectedItem.category})</span>
                    <span>{marketRates.rates[selectedItem.category]?.multiplier ?? 1.0}x</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-base font-black text-emerald-300">
                    <span>최종 위탁 매각 수령액</span>
                    <span>${selectedPayout.toLocaleString()}</span>
                  </div>
                </div>

                {/* Sell Action Button */}
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(true)}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-navy-950 font-serif font-black text-sm shadow-lg shadow-emerald-500/25 transition-all duration-150 ease-out active:scale-95 hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>즉시 위탁 매각 & 현금 ${calculatePayout(selectedItem).toLocaleString()} 수령</span>
                </button>
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-navy-900/40 border border-dashed border-slate-800 text-slate-400 text-xs">
                왼쪽 목록에서 매각할 유물을 선택하세요.
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {isConfirmOpen && selectedItem && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          tone="danger"
          title="유물을 위탁 매각할까요?"
          description={`${selectedItem.name}을(를) 매각하고 $${selectedPayout.toLocaleString()}를 받습니다. 위탁 매각은 되돌릴 수 없습니다.`}
          confirmLabel="매각 확정"
          cancelLabel="취소"
          onConfirm={() => {
            setIsConfirmOpen(false);
            handleSell();
          }}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </>
  );
};
