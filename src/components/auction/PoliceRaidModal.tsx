import React, { useEffect } from 'react';
import { ShieldAlert, DollarSign, Footprints, AlertTriangle, Siren } from 'lucide-react';
import { useAuctionStore } from '../../stores/useAuctionStore';
import { AssetImage } from '../common/AssetImage';
import { assetSrcSet } from '../../services/assetService';
import { useModalA11y } from '../../hooks/useModalA11y';

export const PoliceRaidModal: React.FC = () => {
  const {
    policeRaidState,
    isPoliceRaidModalOpen,
    escapePoliceRaid,
    bribePoliceRaid,
    tickPoliceRaidTimer,
    players,
    currentItem,
  } = useAuctionStore();
  const dialogRef = useModalA11y<HTMLDivElement>(isPoliceRaidModalOpen && policeRaidState.isActive, () => {}, {
    closeOnEscape: false,
    initialFocusSelector: '[data-raid-escape]',
  });

  const user = players.find((p) => p.isHuman);
  const canAffordBribe = (user?.cash || 0) >= policeRaidState.totalCost;

  // 1초 단위 긴급 카운트다운 틱
  useEffect(() => {
    if (!isPoliceRaidModalOpen || !policeRaidState.isActive) return;

    const timer = setInterval(() => {
      tickPoliceRaidTimer();
    }, 1000);

    return () => clearInterval(timer);
  }, [isPoliceRaidModalOpen, policeRaidState.isActive, tickPoliceRaidTimer]);

  if (!isPoliceRaidModalOpen || !policeRaidState.isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* 붉은색/푸른색 경찰 경광등 배경 애니메이션 */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-blue-600/20 animate-pulse pointer-events-none" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="police-raid-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-lg bg-zinc-900/95 border-2 border-red-500/80 rounded-2xl p-6 shadow-2xl text-center backdrop-blur-xl overflow-hidden"
      >
        {/* 상단 사이렌 & 경고 헤더 */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <Siren className="w-8 h-8 text-red-500 animate-bounce" />
          <h2 id="police-raid-modal-title" className="text-2xl font-black tracking-wider text-red-400 font-display">
            🚨 경찰 긴급 급습! (POLICE RAID)
          </h2>
          <Siren className="w-8 h-8 text-blue-500 animate-bounce" />
        </div>

        <p className="text-sm font-medium text-zinc-300 mb-4 leading-relaxed">
          인터폴과 중무장 경찰특공대가 암시장을 포위했습니다!<br />
          <span className="text-red-400 font-semibold">5초 안에 탈출하거나 뇌물로 경찰 서장을 매수</span>해야 합니다!
        </p>

        {/* 카운트다운 타이머 바 */}
        <div className="mb-5 bg-zinc-800/80 rounded-xl p-3 border border-red-500/30">
          <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
            <span>체포까지 남은 시간</span>
            <span role="timer" aria-live="assertive" aria-atomic="true" aria-label={`체포까지 ${policeRaidState.timeLeft}초`} className="font-mono font-black text-red-400 text-lg">
              {policeRaidState.timeLeft}s
            </span>
          </div>
          <div className="w-full bg-zinc-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(policeRaidState.timeLeft / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* 출품 밀수품 정보 */}
        {currentItem && (
          <div className="mb-6 p-3.5 bg-zinc-800/60 rounded-xl border border-zinc-700/60 flex items-center gap-3 text-left">
            <AssetImage
              src={currentItem.imageUrl}
              srcSet={assetSrcSet(currentItem.imageUrl, 512, '-256', 256)}
              sizes="56px"
              width={512}
              height={512}
              alt={currentItem.name}
              className="w-14 h-14 object-cover rounded-lg border border-red-500/40"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                금기된 밀수품 압류 위기
              </div>
              <div className="text-sm font-bold text-zinc-100 truncate">{currentItem.name}</div>
              <div className="text-xs text-amber-300 font-mono font-semibold">
                {currentItem.isAppraised
                  ? `감정 결과: ${currentItem.isFake ? '위작 판정' : '진품 판정'}`
                  : `감정 추정: $${currentItem.estimatedMin.toLocaleString()} ~ $${currentItem.estimatedMax.toLocaleString()}`}
              </div>
            </div>
          </div>
        )}

        {/* 선택 액션 버튼 2종 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. 빈손으로 즉시 탈출 */}
          <button
            type="button"
            data-raid-escape
            onClick={escapePoliceRaid}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm transition-all duration-200 active:scale-95 border border-zinc-600 shadow-md min-h-[48px]"
          >
            <Footprints className="w-4 h-4 text-emerald-400" />
            🏃 즉시 탈출 (무사 귀환)
          </button>

          {/* 2. 경찰 서장 뇌물 매수 */}
          <button
            type="button"
            onClick={bribePoliceRaid}
            disabled={!canAffordBribe}
            className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 shadow-lg min-h-[48px] ${
              canAffordBribe
                ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white border border-amber-400/50'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-300" />
            💰 뇌물 + 낙찰 (${policeRaidState.totalCost.toLocaleString()})
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-left text-xs font-mono text-amber-200">
          <div className="flex justify-between"><span>경찰 뇌물</span><span>${policeRaidState.bribeFee.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>아이템 시작가</span><span>${policeRaidState.itemPrice.toLocaleString()}</span></div>
          <div className="mt-1 flex justify-between border-t border-amber-500/20 pt-1 font-black"><span>총비용</span><span>${policeRaidState.totalCost.toLocaleString()}</span></div>
        </div>

        {!canAffordBribe && (
          <p className="text-xs text-red-400 mt-2 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            보유 현금이 부족하여 매수할 수 없습니다! (즉시 탈출하십시오)
          </p>
        )}
      </div>
    </div>
  );
};
