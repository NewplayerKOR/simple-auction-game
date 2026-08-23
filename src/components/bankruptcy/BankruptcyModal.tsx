import React from 'react';
import { AlertOctagon, RotateCcw, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';
import { useCareerStore } from '../../stores/useCareerStore';
import { BANKRUPTCY_CONFIG } from '../../data/constants';

interface BankruptcyModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const BankruptcyModal: React.FC<BankruptcyModalProps> = ({ isOpen, onClose }) => {
  const { profile, declareBankruptcy } = useCareerStore();

  const isModalVisible = isOpen || profile.isBankrupt;
  if (!isModalVisible) return null;

  const handleDeclareBankruptcy = () => {
    declareBankruptcy();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-lg animate-fade-in">
      <div 
        className="w-full max-w-lg rounded-3xl bg-navy-950/90 backdrop-blur-xl border border-red-500/40 shadow-2xl shadow-red-500/20 overflow-hidden flex flex-col p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
            <AlertOctagon className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider bg-red-950/80 border border-red-500/40 text-red-300 uppercase mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              FINANCIAL COLLAPSE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-slate-100 tracking-wide">
              파산 선고: 자금 고갈
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm leading-relaxed font-sans">
              위작 낙찰, 과열 경쟁 및 대출 상환으로 인해 가용 자산이 한계치 미만으로 고갈되었습니다.
            </p>
          </div>
        </div>

        {/* Current State Summary Card (Frosted Glass) */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-navy-900/60 border border-slate-800">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">잔여 가용 현금</span>
            <span className={`text-lg sm:text-xl font-mono tracking-tight font-black ${
              profile.careerCash < 0 ? 'text-red-400' : 'text-slate-200'
            }`}>
              ${profile.careerCash.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">현재 총 순자산</span>
            <span className="text-lg sm:text-xl font-mono tracking-tight font-black text-red-400">
              ${profile.careerNetWorth.toLocaleString()}
            </span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              파산 기준선
            </span>
            <span className="font-mono text-slate-300">
              현금 &lt; ${BANKRUPTCY_CONFIG.CASH_THRESHOLD} / 순자산 &lt; ${BANKRUPTCY_CONFIG.NET_WORTH_THRESHOLD.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Bailout Notice Card */}
        <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-slate-300 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-gold-300">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>신용 회복 긴급 구제 프로그램 (Bailout)</span>
          </div>
          <ul className="space-y-1 text-slate-400 list-disc list-inside leading-relaxed text-[11px]">
            <li>모든 보유 유물이 부채 상환을 위해 자동 청산됩니다.</li>
            <li>정부 긴급 구제 자금 <strong className="text-emerald-400 font-mono font-bold">${BANKRUPTCY_CONFIG.SEED_RECOVERY_CASH.toLocaleString()}</strong>이 즉시 재지급됩니다.</li>
            <li>브론즈 룸(벼룩시장)부터 다시 경매 커리어를 시작할 수 있습니다.</li>
            <li>누적 파산 횟수: <span className="text-gold-300 font-mono font-bold">{profile.bankruptcyCount || 0}</span>회</li>
          </ul>
        </div>

        {/* Action Button (Apple HIG 48px tactile active:scale-95) */}
        <button
          onClick={handleDeclareBankruptcy}
          className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-gold-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-500/25 flex items-center justify-center gap-2.5 transition-all duration-150 ease-out active:scale-95 hover:brightness-110 hover:shadow-red-500/40 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>파산 신청 &amp; ${BANKRUPTCY_CONFIG.SEED_RECOVERY_CASH.toLocaleString()} 긴급 구제 자금 받기</span>
        </button>
      </div>
    </div>
  );
};
