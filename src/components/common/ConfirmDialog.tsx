import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useModalA11y } from '../../hooks/useModalA11y';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A11Y-001 공통 확인 모달.
 * 파괴적이거나 되돌릴 수 없는 동작 전에 사용하며, 기본 포커스는 안전한 '취소'에 둔다.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = '취소',
  tone = 'default',
  onConfirm,
  onCancel,
}) => {
  const titleId = React.useId();
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onCancel, {
    initialFocusSelector: '[data-confirm-cancel]',
  });

  if (!isOpen) return null;
  const isDanger = tone === 'danger';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full max-w-md rounded-3xl border-2 p-6 shadow-2xl bg-navy-950 ${
          isDanger ? 'border-red-500/70 shadow-red-500/20' : 'border-gold-500/50 shadow-gold-500/10'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-2xl border flex-shrink-0 ${
              isDanger
                ? 'bg-red-500/15 border-red-500/40 text-red-400'
                : 'bg-gold-500/15 border-gold-500/40 text-gold-300'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-serif text-lg font-black text-slate-100">
              {title}
            </h2>
            {description && (
              <div className="mt-2 text-xs leading-relaxed text-slate-300 font-sans">
                {description}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="확인 창 닫기"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            data-confirm-cancel
            onClick={onCancel}
            className="min-h-[48px] rounded-2xl border border-slate-700 bg-navy-900 text-slate-200 text-sm font-bold hover:border-slate-500 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[48px] rounded-2xl text-sm font-black transition-colors ${
              isDanger
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-gradient-to-r from-gold-500 to-gold-600 text-navy-950 hover:brightness-110'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
