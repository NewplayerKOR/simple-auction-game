import React, { useState, useEffect } from 'react';
import { Check, Trophy } from 'lucide-react';
import { useAuctionStore } from '../../stores/useAuctionStore';

export const SealedBidModal: React.FC = () => {
  const { isSealedBidModalOpen, sealedBids, currentItem, closeSealedBidModal } = useAuctionStore();
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (isSealedBidModalOpen) {
      setIsRevealed(false);
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isSealedBidModalOpen]);

  if (!isSealedBidModalOpen || !currentItem) return null;

  const winner = sealedBids[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-navy-950 border-2 border-gold-500/60 rounded-3xl w-full max-w-2xl p-6 shadow-2xl shadow-gold-500/20 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-xs font-serif font-bold tracking-widest uppercase mb-4">
          <img src="/assets/images/ui/icon_sealed_envelope.webp" alt="봉투" className="w-5 h-5 object-contain" />
          <span>4R 비밀 봉투 동시 개봉 (SEALED-BID REVEAL)</span>
        </div>

        <h2 className="font-serif text-xl sm:text-2xl font-black text-slate-100 mb-1">
          {currentItem.name}
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          참가자 전원이 비공개로 적어낸 입찰 봉투를 동시에 오픈합니다!
        </p>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {sealedBids.map((sub, idx) => {
            const isTop = idx === 0 && isRevealed;
            return (
              <div
                key={sub.playerId}
                className={`p-4 rounded-2xl border transition-all duration-700 flex flex-col items-center justify-between ${
                  isTop
                    ? 'bg-gold-500/20 border-gold-400 scale-105 shadow-xl shadow-gold-500/30'
                    : 'bg-navy-900/60 border-slate-800'
                }`}
              >
                <img
                  src={sub.avatar}
                  alt={sub.playerName}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-slate-700 mb-2 shadow-sm"
                />
                <span className={`text-xs font-bold truncate max-w-full ${sub.isHuman ? 'text-gold-300' : 'text-slate-200'}`}>
                  {sub.playerName}
                </span>

                <div className="mt-3 w-full py-2 rounded-xl bg-navy-950/80 border border-slate-800">
                  {isRevealed ? (
                    <div className="animate-fade-in">
                      <span className="text-[10px] text-slate-400 block font-mono">제출 금액</span>
                      <span className={`font-mono font-black text-sm ${isTop ? 'text-gold-300 font-bold' : 'text-slate-300'}`}>
                        ${sub.amount.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-mono py-1">
                      <img src="/assets/images/ui/icon_sealed_envelope.webp" alt="밀봉" className="w-4 h-4 object-contain animate-bounce" />
                      <span>밀봉됨</span>
                    </div>
                  )}
                </div>

                {isTop && (
                  <span className="mt-2 px-2 py-0.5 rounded-full bg-gold-500 text-navy-950 text-[10px] font-black uppercase flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> 최종 낙찰!
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {isRevealed && (
          <button
            onClick={closeSealedBidModal}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 font-serif font-black text-sm hover:brightness-110 shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 animate-fade-in"
          >
            <Check className="w-4 h-4" />
            {!winner || winner.amount === 0
              ? '전원 기권 · 유찰 확인'
              : winner.isHuman
                ? '🎉 나의 낙찰 확인 및 가치 공개'
                : `🎉 ${winner.playerName} 낙찰 확인`}
          </button>
        )}
      </div>
    </div>
  );
};
