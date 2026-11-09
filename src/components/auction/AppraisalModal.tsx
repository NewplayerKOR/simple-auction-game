import React from 'react';
import { Search, Check } from 'lucide-react';
import { useAuctionStore } from '../../stores/useAuctionStore';
import { AssetImage } from '../common/AssetImage';
import { useModalA11y } from '../../hooks/useModalA11y';
import { assetUrl } from '../../services/assetService';

export const AppraisalModal: React.FC = () => {
  const { isAppraisalModalOpen, appraisalBriefing, closeAppraisalModal } = useAuctionStore();
  const dialogRef = useModalA11y<HTMLDivElement>(isAppraisalModalOpen, closeAppraisalModal);

  if (!isAppraisalModalOpen || !appraisalBriefing) return null;

  const isForgery = appraisalBriefing.verdict === 'FORGERY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="appraisal-modal-title"
        tabIndex={-1}
        className={`bg-navy-950 border-2 rounded-3xl w-full max-w-md p-6 shadow-2xl text-center relative overflow-hidden ${
          isForgery ? 'border-red-500/70 shadow-red-500/20' : 'border-emerald-500/70 shadow-emerald-500/20'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3">
          {isForgery ? (
            <AssetImage
              src={assetUrl('/assets/images/ui/stamp_fake.webp')}
              width={256}
              height={256}
              alt="위작 도장"
              className="w-24 h-24 object-contain drop-shadow-xl -rotate-6 animate-pulse"
            />
          ) : (
            <AssetImage
              src={assetUrl('/assets/images/ui/stamp_genuine.webp')}
              width={256}
              height={256}
              alt="진품 도장"
              className="w-24 h-24 object-contain drop-shadow-xl animate-bounce-short"
            />
          )}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-900 border border-slate-700 text-slate-300 text-xs font-mono mb-2">
          <Search className="w-3.5 h-3.5 text-gold-400" /> 소더비 수석 감정원 브리핑
        </div>

        <h3 id="appraisal-modal-title" className="font-serif text-lg font-bold text-slate-100 mb-1">
          {appraisalBriefing.itemName}
        </h3>

        <div className={`my-4 p-4 rounded-2xl border text-xs leading-relaxed font-medium ${
          isForgery
            ? 'bg-red-950/40 border-red-500/40 text-red-200'
            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
        }`}>
          {appraisalBriefing.confidenceText}
        </div>

        <button
          type="button"
          onClick={closeAppraisalModal}
          className={`w-full py-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
            isForgery
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
          }`}
        >
          <Check className="w-4 h-4" /> 감정 결과 접수 완료
        </button>
      </div>
    </div>
  );
};
