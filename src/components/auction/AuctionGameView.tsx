import React, { useEffect, useState } from 'react';
import {
  Clock,
  Sparkles,
  Search,
  Shield,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Award,
  Newspaper,
  Zap,
  Flame,
  XCircle
} from 'lucide-react';
import { useAuctionStore } from '../../stores/useAuctionStore';
import { BID_INCREMENT_OPTIONS, LOAN_CONFIG } from '../../data/constants';
import { getAppraisalCost } from '../../services/itemValueService';
import { assetUrl, assetSrcSet } from '../../services/assetService';
import { getItemLotLabel } from '../../services/itemDisplayService';
import { AssetImage } from '../common/AssetImage';
import { MarketEventModal } from './MarketEventModal';
import { AppraisalModal } from './AppraisalModal';
import { SealedBidModal } from './SealedBidModal';
import { PoliceRaidModal } from './PoliceRaidModal';

export const AuctionGameView: React.FC = () => {
  const {
    currentRound,
    totalRounds,
    auctionMode,
    fsmState,
    currentItem,
    players,
    currentHighestBid,
    highestBidder,
    timeLeft,
    accumulatedIncrement,
    baseIncrement,
    dutchState,
    isInsuranceActive,
    insuranceRefundAmount,
    activeMarketEvent,
    addIncrement,
    resetIncrement,
    placeBid,
    claimDutchAuction,
    requestAppraisal,
    takeEmergencyLoan,
    useChanceCard,
    submitSealedBid,
    startBidding,
    tickTimer,
    nextRound,
  } = useAuctionStore();

  const [sealedBidInput, setSealedBidInput] = useState<number>(0);

  const humanPlayer = players.find((p) => p.isHuman);
  const userCash = humanPlayer?.cash ?? 0;
  const appraisalCost = getAppraisalCost(currentItem);
  const committedBid = fsmState === 'BIDDING_ACTIVE' && highestBidder?.id === humanPlayer?.id
    ? currentHighestBid
    : 0;
  const spendableCash = userCash - committedBid;
  const timerAnnouncement = [10, 5, 3, 2, 1].includes(timeLeft)
    ? `경매 종료까지 ${timeLeft}초`
    : '';
  const bidAnnouncement = highestBidder
    ? `현재 최고가 ${currentHighestBid.toLocaleString()}달러, ${highestBidder.name}`
    : '아직 입찰 없음';

  // 잉글리시 & 비밀 경매 타이머 틱 인터벌
  useEffect(() => {
    if (auctionMode === 'ENGLISH' && (fsmState === 'BIDDING_ACTIVE' || fsmState === 'SEALED_BID_ACTIVE')) {
      const interval = setInterval(() => {
        tickTimer();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [auctionMode, fsmState, tickTimer]);

  // QD-23: 라운드·출품작이 바뀔 때만 입력값을 시작가로 초기화한다.
  // 사용자가 0원 기권을 입력한 뒤 재렌더되어도 값을 덮어쓰지 않는다.
  useEffect(() => {
    if (currentItem) {
      setSealedBidInput(currentItem.startingBid);
    }
  }, [currentRound, currentItem?.id]);

  if (!currentItem) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">경매 출품작을 준비하는 중입니다...</p>
      </div>
    );
  }

  // 잉글리시 스택형 최종 예상 입찰가
  const targetBidAmount = currentHighestBid + baseIncrement + accumulatedIncrement;
  const canAffordBid = userCash >= targetBidAmount;
  const isUrgent = timeLeft <= 3;
  const isRound4 = currentRound === 4;

  // 더치 역경매 가격 비율
  const dutchRange = (currentItem.dutchStartPrice - currentItem.dutchFloorPrice) || 1;
  const dutchCurrentDrop = Math.max(0, currentItem.dutchStartPrice - dutchState.currentPrice);
  const dutchProgressPct = Math.min(100, Math.max(0, (dutchCurrentDrop / dutchRange) * 100));
  const canAffordDutch = userCash >= dutchState.currentPrice;

  const handleUserBid = () => {
    if (!humanPlayer || !canAffordBid) return;
    placeBid(humanPlayer.id, targetBidAmount);
  };

  const handleUserDutchClaim = () => {
    if (!humanPlayer || !canAffordDutch || dutchState.isClaimed) return;
    claimDutchAuction(humanPlayer.id);
  };

  const handleSealedBidSubmit = () => {
    if (!humanPlayer || userCash < sealedBidInput) return;
    submitSealedBid(sealedBidInput);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative bg-auction-pattern"
    >
      {/* Dark Luxury Overlay */}
      <div className="absolute inset-0 bg-navy-950/85 backdrop-blur-[2px]" />

      {/* A11Y-001: 타이머는 10·5·3·2·1초에서만, 입찰가는 변경 시마다 보조기기에 알린다. */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">{timerAnnouncement}</div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">{bidAnnouncement}</div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* Active Market Event Banner (3R, 5R) */}
        {activeMarketEvent && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/90 via-navy-900 to-navy-950 border border-red-500/40 flex items-center justify-between shadow-xl animate-pulse-fast backdrop-blur-md">
            <div className="flex items-center gap-3">
              {activeMarketEvent.imageUrl ? (
                <AssetImage
                  src={activeMarketEvent.imageUrl}
                  srcSet={assetSrcSet(activeMarketEvent.imageUrl, 512, '-256', 256)}
                  sizes="56px"
                  width={512}
                  height={286}
                  loading="eager"
                  alt={activeMarketEvent.title}
                  className="w-14 h-10 rounded-lg object-cover border border-red-500/50 shadow-md flex-shrink-0"
                />
              ) : (
                <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
                  <Newspaper className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">시장 속보 발효 중</span>
                <p className="text-xs text-slate-200 font-medium">
                  {activeMarketEvent.title} — <span className="text-amber-300 font-bold">{activeMarketEvent.headline}</span>
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-gold-400 bg-navy-950 px-3 py-1 rounded-full border border-slate-700 shadow-inner">
              {activeMarketEvent.effectType === 'CATEGORY_MULTIPLIER'
                ? `${activeMarketEvent.targetCategory} 가치 ${activeMarketEvent.multiplier ?? 1.5}배`
                : `지원금 $${(activeMarketEvent.cashAmount ?? 0).toLocaleString()} 지급`}
            </span>
          </div>
        )}

        {/* Top Banner: Mode, Round Type & Status */}
        <div className="bg-navy-900/90 border border-gold-500/30 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 font-serif font-bold text-sm flex items-center gap-2">
              {auctionMode === 'DUTCH' ? (
                <>
                  <Zap className="w-4 h-4 text-amber-400 fill-current animate-pulse" />
                  <span>{currentRound}R 더치 역경매 (Dutch Falling-Price)</span>
                </>
              ) : isRound4 ? (
                <>
                  <AssetImage src={assetUrl('/assets/images/ui/icon_sealed_envelope.webp')} width={128} height={128} alt="봉투" className="w-5 h-5 object-contain" />
                  <span>4R 비밀 봉투 경매 (Sealed-Bid)</span>
                </>
              ) : (
                <>
                  <span>🏛️</span>
                  <span>{currentRound}R 실시간 잉글리시 호가 경매</span>
                </>
              )}
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {auctionMode === 'DUTCH'
                ? '초당 가격이 하락하며 가장 먼저 [지금 구매]를 누른 1인이 낙찰'
                : isRound4
                ? '15초 단판 비공개 최고가 낙찰'
                : '10초 카운트다운 + 5초 앤티 스나이핑'}
            </span>
          </div>

          {/* English Timer Bar */}
          {auctionMode === 'ENGLISH' && (fsmState === 'BIDDING_ACTIVE' || fsmState === 'SEALED_BID_ACTIVE') && (
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400 animate-spin' : 'text-gold-400'}`} />
                <span
                  role="timer"
                  aria-label={`남은 시간 ${timeLeft}초`}
                  className={`text-lg ${isUrgent ? 'text-red-400 font-black animate-pulse' : 'text-gold-300'}`}
                >
                  {timeLeft}s
                </span>
              </div>
              <div className="flex-1 md:w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isUrgent ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-gold-500 to-amber-400'
                  }`}
                  style={{ width: `${(timeLeft / (isRound4 ? 15 : 10)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Dutch Mode Active Indicator */}
          {auctionMode === 'DUTCH' && fsmState === 'DUTCH_DROPPING' && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold animate-pulse">
              <Flame className="w-4 h-4 text-red-400" />
              <span>실시간 가격 하락 진행 중 (초당 -${currentItem.dutchDropRatePerSec})</span>
            </div>
          )}

          {/* FSM Status Callout Controls */}
          {(fsmState === 'ROUND_INTRO' || fsmState === 'DUTCH_INTRO') && (
            <button
              onClick={startBidding}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-gold-500/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {auctionMode === 'DUTCH' ? '더치 역경매 시작' : isRound4 ? '비밀 경매 시작하기' : '경매 개시 (입찰 시작)'}
            </button>
          )}

          {(fsmState === 'ROUND_REVEAL' || fsmState === 'ROUND_PASSED') && (
            <button
              onClick={nextRound}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-bold text-xs hover:brightness-110 shadow-lg flex items-center gap-2"
            >
              <span>{currentRound >= totalRounds ? '최종 정산 및 시상식' : '다음 라운드 진행'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Main Grid: Item Stage (Left) & Players Panel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center: Item Stage Card */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-navy-900/80 border border-gold-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 backdrop-blur-md">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Item Image with Badges & Stamp Overlay */}
              <div className="relative md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 border-gold-500/40 group shadow-2xl">
                <AssetImage
                  src={currentItem.imageUrl}
                  srcSet={assetSrcSet(currentItem.imageUrl, 512, '-256', 256)}
                  sizes="(min-width: 1024px) 420px, (min-width: 768px) 45vw, 90vw"
                  width={512}
                  height={512}
                  loading="eager"
                  alt={currentItem.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-navy-950/90 border border-gold-500/40 text-[11px] font-bold text-gold-300 uppercase tracking-wider backdrop-blur-sm">
                  {currentItem.category}
                </div>

                {/* STAMP OVERLAYS (진품 / 위작 Reveal 시 투명 배경 스탬프 이펙트) */}
                {fsmState === 'ROUND_REVEAL' && currentItem.isFake && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-gavel-strike pointer-events-none">
                    <AssetImage
                      src={assetUrl('/assets/images/ui/stamp_fake.webp')}
                      width={256}
                      height={256}
                      alt="위작 판정"
                      className="w-52 h-52 object-contain drop-shadow-2xl -rotate-12 transform scale-110"
                    />
                  </div>
                )}
                {fsmState === 'ROUND_REVEAL' && !currentItem.isFake && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] animate-bounce-short pointer-events-none">
                    <AssetImage
                      src={assetUrl('/assets/images/ui/stamp_genuine.webp')}
                      width={256}
                      height={256}
                      alt="진품 판정"
                      className="w-48 h-48 object-contain drop-shadow-2xl"
                    />
                  </div>
                )}

                {/* Status Badges on Image */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                  {currentItem.condition && (
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-md flex items-center gap-1 ${
                      currentItem.condition === 'PRISTINE'
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                        : currentItem.condition === 'DUSTY'
                        ? 'bg-amber-950/90 border-amber-500 text-amber-300'
                        : currentItem.condition === 'DAMAGED'
                        ? 'bg-orange-950/90 border-orange-500 text-orange-300'
                        : 'bg-red-950/90 border-red-500 text-red-300'
                    }`}>
                      {currentItem.condition === 'PRISTINE' ? '🟢 완벽 보존 (100%)' : currentItem.condition === 'DUSTY' ? '🟡 먼지 쌓임 (80%)' : currentItem.condition === 'DAMAGED' ? '🔴 심각한 훼손 (50%)' : '💀 영구 훼손 (20%)'}
                    </span>
                  )}
                  {currentItem.isAppraised && (
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-md flex items-center gap-1 ${
                      currentItem.isFake 
                        ? 'bg-red-950/90 border-red-500 text-red-300' 
                        : 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                    }`}>
                      {currentItem.isFake ? <AlertOctagon className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {currentItem.isFake ? '⚠️ 위작(가짜) 확정' : '✅ 진품 감정 완료'}
                    </span>
                  )}
                  {isInsuranceActive && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-blue-950/90 border-blue-500 text-blue-300 backdrop-blur-md flex items-center gap-1">
                      <Shield className="w-3 h-3" /> 안심 보험 적용 중
                    </span>
                  )}
                </div>
              </div>

              {/* Item Details & Valuation */}
              <div className="md:w-1/2 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">{getItemLotLabel(currentItem.id)}</span>
                    {currentItem.synergyPairName && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/30 font-medium">
                        ✨ {currentItem.synergyPairName}
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-slate-100 mt-1 flex items-center gap-2">
                    {currentItem.name}
                    {currentItem.isContraband && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/90 text-red-400 border border-red-500 font-bold animate-pulse">
                        🚨 금기 밀수품
                      </span>
                    )}
                  </h2>
                  {currentItem.isContraband && currentItem.curseDebuff && (
                    <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/40 text-[11px] text-red-300 font-medium mt-1">
                      ⚠️ <strong className="text-red-400">저주 디버프:</strong> {currentItem.curseDebuff}
                    </div>
                  )}
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {currentItem.description}
                  </p>
                  <p className="text-[11px] text-slate-400 italic mt-1">
                    {currentItem.historicalLore}
                  </p>
                </div>

                {/* Valuation Box */}
                <div className="bg-navy-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  {/* 감정가 추정 범위 vs 실제 가치 Reveal */}
                  {fsmState === 'ROUND_REVEAL' ? (
                    <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/40 text-center animate-bounce-short space-y-2">
                      <span className="text-[11px] text-gold-400 font-bold uppercase tracking-wider block">실제 시장 가치 공개</span>
                      <div className="text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-amber-300">
                        ${currentItem.realValue.toLocaleString()}
                      </div>
                      {currentItem.isFake && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-red-400 block">
                            ⚠️ 위작 판정으로 가치가 $0 처리되었습니다!
                          </span>
                          {highestBidder && !highestBidder.isHuman && (
                            <div className="p-2.5 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-serif font-bold text-left flex items-center gap-2.5 shadow-md">
                              <AssetImage src={highestBidder.avatar} srcSet={assetSrcSet(highestBidder.avatar, 128, '-64', 64)} sizes="32px" width={128} height={128} alt={highestBidder.name} className="w-8 h-8 rounded-lg border border-red-400 object-cover flex-shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[10px] text-red-400 block">{highestBidder.name}의 절규:</span>
                                <span className="text-red-100 italic block truncate">"{highestBidder.lastDialogue || '아아악!! 가짜라고?! 러그풀 사기당했다!!'}"</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {insuranceRefundAmount && (
                        <div className="mt-2 py-1 px-3 rounded-lg bg-blue-950 border border-blue-500/50 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-blue-400" />
                          안심 보험으로 손실액 ${insuranceRefundAmount.toLocaleString()} 전액 환급 완료!
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">감정원 추정 범위:</span>
                      <span className="font-mono font-bold text-gold-300 text-sm">
                        ${currentItem.estimatedMin.toLocaleString()} ~ ${currentItem.estimatedMax.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Mode Specific Current Price Display */}
                  {auctionMode === 'DUTCH' ? (
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-xs text-slate-400 block">현재 하락 호가</span>
                          <span className="font-serif font-black text-3xl text-amber-400 animate-pulse">
                            ${dutchState.currentPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right text-xs font-mono">
                          <span className="text-slate-500 block">시작가: ${currentItem.dutchStartPrice.toLocaleString()}</span>
                          <span className="text-red-400 block font-bold">바닥가: ${currentItem.dutchFloorPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Drop Gauge */}
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all duration-300"
                          style={{ width: `${100 - dutchProgressPct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-xs text-slate-400 block">현재 최고 호가</span>
                        <span aria-live="polite" aria-atomic="true" className="font-serif font-black text-2xl text-emerald-400">
                          ${currentHighestBid.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">최고 입찰자</span>
                        <span className="font-bold text-xs text-slate-200">
                          {highestBidder ? highestBidder.name : '아직 입찰 없음'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interaction Area: Dutch Claim vs English Stack / Sealed Bid */}
            {auctionMode === 'DUTCH' ? (
              /* Dutch Mode Claim Card (Apple HIG) */
              <div className="bg-navy-950/75 border border-gold-500/30 rounded-3xl p-6 shadow-2xl space-y-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-serif text-xs sm:text-sm font-bold text-gold-300 uppercase tracking-wider">
                      더치 역경매 선착순 낙찰 구매기
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">내 보유 현금: <strong className="text-emerald-400 font-black">${userCash.toLocaleString()}</strong></span>
                </div>

                {fsmState === 'DUTCH_DROPPING' ? (
                  <button
                    onClick={handleUserDutchClaim}
                    disabled={!canAffordDutch || dutchState.isClaimed}
                    className="w-full min-h-[56px] py-4 px-6 rounded-2xl bg-gradient-to-r from-red-500 via-amber-500 to-yellow-500 text-slate-950 font-serif font-black text-lg sm:text-xl shadow-2xl shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all duration-150 ease-out flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Zap className="w-6 h-6 fill-current" />
                    <span>⚡ 지금 구매! (${dutchState.currentPrice.toLocaleString()})</span>
                  </button>
                ) : fsmState === 'DUTCH_CLAIMED' ? (
                  <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-center space-y-1 shadow-lg">
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">⚡ 낙찰 확정!</span>
                    <p className="font-serif text-base sm:text-lg font-bold text-slate-100">
                      {highestBidder?.name}님이 <span className="font-mono font-black text-emerald-400">${dutchState.claimedPrice?.toLocaleString()}</span>에 선점 낙찰되었습니다!
                    </p>
                  </div>
                ) : fsmState === 'DUTCH_FLOOR_PASSED' ? (
                  <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500 text-center space-y-1 shadow-lg">
                    <XCircle className="w-6 h-6 text-red-400 mx-auto" />
                    <p className="font-serif text-sm sm:text-base font-bold text-red-300">
                      바닥가(${currentItem.dutchFloorPrice.toLocaleString()}) 도달로 유찰되었습니다.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 text-center text-xs text-slate-400 font-sans">
                    경매 개시 후 실시간으로 가격이 떨어집니다. 적정 가치라 판단될 때 [지금 구매]를 누르세요.
                  </div>
                )}
              </div>
            ) : isRound4 && fsmState === 'SEALED_BID_ACTIVE' ? (
              /* 4R 비밀 봉투 비공개 입력 */
              <div className="bg-navy-950/75 border border-gold-500/30 rounded-3xl p-6 shadow-2xl space-y-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm sm:text-base font-bold text-gold-300 flex items-center gap-2">
                    <AssetImage src={assetUrl('/assets/images/ui/icon_sealed_envelope.webp')} width={128} height={128} alt="봉투" className="w-5 h-5 object-contain" />
                    <span>비밀 봉투 입찰가 제출 (1회 한정)</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-300">내 잔고: <strong className="text-emerald-400 font-black">${userCash.toLocaleString()}</strong></span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={userCash}
                    step={500}
                    value={sealedBidInput}
                    onChange={(e) => setSealedBidInput(Math.min(userCash, Math.max(0, Number(e.target.value))))}
                    className="w-full sm:flex-1 min-h-[48px] bg-navy-900 border border-slate-700 rounded-2xl px-4 py-3 text-lg sm:text-xl font-mono font-black text-gold-300 focus:outline-none focus:border-gold-500 shadow-inner"
                  />
                  <button
                    onClick={() => submitSealedBid(0)}
                    className="w-full sm:w-auto min-h-[48px] px-5 py-3.5 rounded-2xl bg-navy-900 border border-slate-700 text-slate-300 font-bold text-sm hover:border-slate-500 active:scale-95 transition-all duration-150 ease-out cursor-pointer"
                  >
                    0원 기권
                  </button>
                  <button
                    onClick={handleSealedBidSubmit}
                    className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-serif font-black text-sm hover:brightness-110 active:scale-95 transition-all duration-150 ease-out shadow-lg shadow-gold-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <AssetImage src={assetUrl('/assets/images/ui/icon_sealed_envelope.webp')} width={128} height={128} alt="봉투" className="w-4 h-4 object-contain" />
                    <span>봉투 밀봉 제출</span>
                  </button>
                </div>
              </div>
            ) : (
              /* 잉글리시 실시간 스택형 호가 컨트롤러 */
              <div className="bg-navy-950/75 border border-gold-500/30 rounded-3xl p-6 shadow-2xl space-y-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gold-400" />
                    <span className="font-serif text-xs sm:text-sm font-bold text-gold-300 uppercase tracking-wider">
                      스택형 호가 증액 컨트롤러
                    </span>
                  </div>
                  {accumulatedIncrement > 0 && (
                    <span className="text-xs font-mono font-black text-amber-400">
                      추가 누적액: +${accumulatedIncrement.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Stack Increment Buttons (Apple HIG min 48px touch targets) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {BID_INCREMENT_OPTIONS.map((inc) => (
                    <button
                      key={inc}
                      onClick={() => addIncrement(inc)}
                      disabled={fsmState !== 'BIDDING_ACTIVE'}
                      className="min-h-[48px] py-3 rounded-2xl bg-navy-900 border border-slate-700/80 hover:border-gold-500/60 text-slate-100 hover:text-gold-300 font-mono font-black text-xs sm:text-sm transition-all duration-150 ease-out active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
                    >
                      +${inc.toLocaleString()}
                    </button>
                  ))}
                  <button
                    onClick={resetIncrement}
                    disabled={accumulatedIncrement === 0 || fsmState !== 'BIDDING_ACTIVE'}
                    className="col-span-2 sm:col-span-1 min-h-[48px] py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-slate-100 font-mono font-bold text-xs sm:text-sm transition-all duration-150 ease-out active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
                  >
                    초기화
                  </button>
                </div>

                {/* Main Place Bid Button */}
                <button
                  onClick={handleUserBid}
                  disabled={fsmState !== 'BIDDING_ACTIVE' || !canAffordBid}
                  className="w-full min-h-[52px] py-4 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-navy-950 font-serif font-black text-base sm:text-lg shadow-xl shadow-gold-500/25 hover:brightness-110 active:scale-95 transition-all duration-150 ease-out disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>입찰하기 (${targetBidAmount.toLocaleString()})</span>
                </button>
              </div>
            )}

            {/* Action Utilities Strip: Chance Cards & Appraisal & Loan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 감정사 의뢰 */}
              <button
                onClick={requestAppraisal}
                disabled={
                  !humanPlayer ||
                  spendableCash < appraisalCost ||
                  currentItem.isAppraised ||
                  fsmState === 'ROUND_REVEAL'
                }
                className="min-h-[48px] p-3.5 rounded-2xl bg-navy-950/75 border border-slate-800 hover:border-gold-500/40 text-left transition-all duration-150 ease-out active:scale-95 disabled:opacity-40 backdrop-blur-sm shadow-md cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-blue-400" /> 감정사 의뢰
                  </span>
                  <span className="text-gold-400 font-mono font-black">${appraisalCost.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  {currentItem.isAppraised ? '감정 완료됨' : '진품/위작 정밀 브리핑'}
                </p>
              </button>

              {/* VIP 긴급 대출 */}
              <button
                onClick={takeEmergencyLoan}
                disabled={!humanPlayer || humanPlayer.hasTakenLoan || fsmState === 'ROUND_REVEAL'}
                className="min-h-[48px] p-3.5 rounded-2xl bg-navy-950/75 border border-slate-800 hover:border-purple-500/40 text-left transition-all duration-150 ease-out active:scale-95 disabled:opacity-40 backdrop-blur-sm shadow-md cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <AssetImage src={assetUrl('/assets/images/ui/icon_vip_loan.webp')} width={128} height={128} alt="VIP 대출" className="w-4 h-4 object-contain" />
                    <span>VIP 긴급 대출</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-black">+${LOAN_CONFIG.AMOUNT.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  {humanPlayer?.hasTakenLoan ? '대출 사용 완료 (상환 -$3,600)' : '게임당 1회 즉시 수혈'}
                </p>
              </button>

              {/* 찬스 카드 목록 */}
              <div className="flex gap-2">
                {(humanPlayer?.chanceCards || []).map((card) => (
                  <button
                    key={card.id}
                    onClick={() => useChanceCard(card.id)}
                    disabled={card.isUsed || fsmState === 'ROUND_REVEAL'}
                    className={`flex-1 min-h-[48px] p-2 rounded-2xl border text-left transition-all duration-150 ease-out active:scale-95 backdrop-blur-sm shadow-md flex items-center gap-2 cursor-pointer ${
                      card.isUsed
                        ? 'bg-slate-900/50 border-slate-800 opacity-40 cursor-not-allowed'
                        : 'bg-navy-950/75 border-gold-500/30 hover:border-gold-400 hover:shadow-gold-500/10'
                    }`}
                    title={card.description}
                  >
                    {card.imageUrl && (
                      <AssetImage
                        src={card.imageUrl}
                        srcSet={assetSrcSet(card.imageUrl, 256, '-128', 128)}
                        sizes="32px"
                        width={256}
                        height={256}
                        alt={card.name}
                        className="w-8 h-8 rounded-lg object-cover border border-gold-500/30 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-gold-300">
                        <span className="truncate">{card.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        {card.isUsed ? '사용됨' : '1회 사용'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Players List & Dialogue Feed */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-navy-900/80 border border-gold-500/30 rounded-3xl p-5 shadow-xl space-y-3 backdrop-blur-md">
              <h3 className="font-serif text-sm font-bold text-gold-300 flex items-center gap-2 pb-2 border-b border-slate-800">
                <Award className="w-4 h-4 text-gold-400" /> 참가자 현황 (4인 배틀)
              </h3>

              <div className="space-y-3">
                {players.map((p) => {
                  const isLeading = highestBidder?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isLeading
                          ? 'bg-navy-950/90 border-gold-400 shadow-md ring-2 ring-gold-400/50'
                          : 'bg-navy-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <AssetImage
                          src={p.avatar}
                          srcSet={assetSrcSet(p.avatar, 128, '-64', 64)}
                          sizes="40px"
                          width={128}
                          height={128}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border-2 border-slate-700 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold truncate ${p.isHuman ? 'text-gold-300' : 'text-slate-200'}`}>
                              {p.name}
                            </span>
                            {isLeading && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold whitespace-nowrap">
                                최고 입찰
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-[11px] font-mono mt-0.5 text-slate-400">
                            <span>잔고: <strong className="text-slate-200">${p.cash.toLocaleString()}</strong></span>
                            <span>소장품: {p.inventory.length}개</span>
                          </div>
                        </div>
                      </div>

                      {/* Bot Bubble Chat Dialogue */}
                      {!p.isHuman && p.lastDialogue && (
                        <p className="text-[10px] text-slate-300 italic mt-2 pt-1.5 border-t border-slate-800/60 leading-snug animate-fade-in">
                          "{p.lastDialogue}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Global Modals for Events / Appraisal / Sealed-Bid / Police Raid */}
        <MarketEventModal />
        <AppraisalModal />
        <SealedBidModal />
        <PoliceRaidModal />
      </div>
    </div>
  );
};

