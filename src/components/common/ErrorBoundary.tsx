import React from 'react';
import { STORAGE_BACKUP_KEY, STORAGE_KEY_V2 } from '../../stores/useCareerStore';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * QD-01: 손상된 저장 데이터나 예상하지 못한 렌더 오류가 백지 화면으로 이어지지 않게 한다.
 * 오류 발생 시 원본 저장을 백업 키로 옮기고, 사용자가 안전하게 초기화할 수 있는 화면을 보여준다.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : '알 수 없는 렌더 오류',
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Unhandled render error.', error, info.componentStack);
  }

  private backupAndReset = (): void => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_V2);
      if (raw) localStorage.setItem(STORAGE_BACKUP_KEY, raw);
      localStorage.removeItem(STORAGE_KEY_V2);
    } catch (error) {
      console.error('[ErrorBoundary] Failed to back up the corrupt profile.', error);
    }
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-navy-950 text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/50 bg-navy-900 p-8 shadow-2xl space-y-4">
          <h1 className="font-serif text-xl font-black text-red-300">화면을 불러오지 못했습니다</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            저장 데이터가 손상되었거나 예상하지 못한 오류가 발생했습니다. 원본 데이터는 백업 키에 보관한 뒤 초기화합니다.
          </p>
          <pre className="max-h-32 overflow-auto rounded-xl bg-navy-950 p-3 text-[11px] text-red-300 font-mono whitespace-pre-wrap">
            {this.state.message}
          </pre>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.backupAndReset}
              className="flex-1 min-h-[48px] rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
            >
              저장 데이터 백업 후 초기화
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 min-h-[48px] rounded-2xl bg-navy-800 border border-slate-700 text-slate-200 text-sm font-bold transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }
}
