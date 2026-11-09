import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusable = (dialog: HTMLElement): HTMLElement[] =>
  Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getAttribute('aria-hidden') !== 'true'
  );

interface ModalA11yOptions {
  /** Escape로 닫을 수 없는 필수 선택 모달은 false로 둔다. */
  closeOnEscape?: boolean;
  /** 열릴 때 기본으로 포커스할 요소 선택자. 없으면 첫 포커스 가능 요소를 사용한다. */
  initialFocusSelector?: string;
}

/**
 * A11Y-001 공통 모달 접근성 Hook.
 * - role="dialog"·aria-modal·aria-labelledby는 호출부에서 지정한다.
 * - 열릴 때 초기 포커스, Tab 순환, Escape 닫기, 닫힐 때 이전 포커스 복귀를 담당한다.
 */
export const useModalA11y = <T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void,
  options: ModalA11yOptions = {}
) => {
  const dialogRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const { closeOnEscape = true, initialFocusSelector } = options;

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusInitial = () => {
      const initial = initialFocusSelector
        ? dialog.querySelector<HTMLElement>(initialFocusSelector)
        : null;
      const focusable = getFocusable(dialog);
      (initial ?? focusable[0] ?? dialog).focus();
    };
    const frame = window.requestAnimationFrame(focusInitial);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (closeOnEscape) {
          event.preventDefault();
          onCloseRef.current();
        }
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusable(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !dialog.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen, closeOnEscape, initialFocusSelector]);

  return dialogRef;
};
