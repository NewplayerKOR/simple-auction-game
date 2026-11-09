import React from 'react';
import { Newspaper, Check } from 'lucide-react';
import { useAuctionStore } from '../../stores/useAuctionStore';
import { AssetImage } from '../common/AssetImage';
import { assetSrcSet } from '../../services/assetService';
import { useModalA11y } from '../../hooks/useModalA11y';

export const MarketEventModal: React.FC = () => {
  const { isMarketEventModalOpen, activeMarketEvent, closeMarketEventModal } = useAuctionStore();
  const dialogRef = useModalA11y<HTMLDivElement>(isMarketEventModalOpen, closeMarketEventModal);

  if (!isMarketEventModalOpen || !activeMarketEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="market-event-modal-title"
        tabIndex={-1}
        className="bg-gradient-to-b from-red-950/90 via-navy-950 to-navy-950 border-2 border-red-500/60 rounded-3xl w-full max-w-lg p-6 shadow-2xl shadow-red-500/20 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Urgent Flashing Light Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-serif font-black tracking-widest uppercase mb-3 animate-bounce-short">
          <Newspaper className="w-4 h-4 text-red-400" />
          BREAKING MARKET NEWS
        </div>

        {/* 16:9 Event Illustration Banner */}
        {activeMarketEvent.imageUrl && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 border-2 border-red-500/40 shadow-2xl group">
            <AssetImage
              src={activeMarketEvent.imageUrl}
              srcSet={assetSrcSet(activeMarketEvent.imageUrl, 512, '-256', 256)}
              sizes="(min-width: 512px) 512px, 100vw"
              width={512}
              height={286}
              loading="eager"
              alt={activeMarketEvent.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />
          </div>
        )}

        <h2 id="market-event-modal-title" className="font-serif text-xl sm:text-2xl font-black text-slate-100 mb-1">
          {activeMarketEvent.title}
        </h2>

        <p className="text-amber-300 font-bold text-sm mb-3">
          "{activeMarketEvent.headline}"
        </p>

        <div className="bg-navy-900/90 border border-slate-700 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed mb-5 shadow-inner">
          {activeMarketEvent.description}
        </div>

        <button
          type="button"
          onClick={closeMarketEventModal}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-serif font-black text-sm hover:brightness-110 shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" /> 시장 속보 확인 및 경매 계속하기
        </button>
      </div>
    </div>
  );
};
