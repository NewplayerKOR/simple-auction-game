import React from 'react';
import { useAuctionStore } from './stores/useAuctionStore';
import { useCareerStore } from './stores/useCareerStore';
import { useCodexStore } from './stores/useCodexStore';
import { Header } from './components/common/Header';
import { LobbyView } from './components/lobby/LobbyView';
import { APP_VERSION } from './version';

// PERF-ASSET-001: 로비 첫 화면에 필요 없는 경매·결과·도감 코드를 지연 로딩한다.
const AuctionGameView = React.lazy(() =>
  import('./components/auction/AuctionGameView').then((module) => ({ default: module.AuctionGameView }))
);
const ResultGalleryView = React.lazy(() =>
  import('./components/gallery/ResultGalleryView').then((module) => ({ default: module.ResultGalleryView }))
);
const CodexModal = React.lazy(() =>
  import('./components/codex/CodexModal').then((module) => ({ default: module.CodexModal }))
);

const ViewFallback: React.FC = () => (
  <div className="min-h-[40vh] flex items-center justify-center text-xs font-mono text-slate-500">
    화면을 불러오는 중...
  </div>
);

export const App: React.FC = () => {
  const { currentView } = useAuctionStore();
  const { persistenceError, clearPersistenceError } = useCareerStore();
  const isCodexModalOpen = useCodexStore((state) => state.isCodexModalOpen);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-gold-500 selection:text-navy-950">
      {/* 저장 실패는 화면 전이를 막고 사용자에게 재시도를 안내한다. */}
      {persistenceError && (
        <div role="alert" className="bg-red-950 border-b border-red-500/60 px-4 py-2 text-center text-xs text-red-200 flex items-center justify-center gap-3">
          <span>{persistenceError}</span>
          <button
            type="button"
            onClick={clearPersistenceError}
            className="px-2 py-1 rounded border border-red-400/50 hover:bg-red-900"
          >
            닫기
          </button>
        </div>
      )}

      {/* Top Global Navigation */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        <React.Suspense fallback={<ViewFallback />}>
          {currentView === 'LOBBY' && <LobbyView />}
          {currentView === 'AUCTION' && <AuctionGameView />}
          {currentView === 'GALLERY' && <ResultGalleryView />}
        </React.Suspense>
      </main>

      {/* Global Codex & Achievements Modal — 열 때만 청크를 불러온다. */}
      {isCodexModalOpen && (
        <React.Suspense fallback={null}>
          <CodexModal />
        </React.Suspense>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-navy-950/90 py-6 text-center text-xs text-slate-400 font-mono">
        <p>SOTHEBY'S ROYALE - WEB AUCTION SIMULATOR v{APP_VERSION}</p>
        <p className="mt-1 text-[11px] text-slate-400">Built with Vite, React 18, TypeScript, TailwindCSS & Zustand</p>
      </footer>
    </div>
  );
};

export default App;
