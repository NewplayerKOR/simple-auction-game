import React from 'react';
import { useAuctionStore } from './stores/useAuctionStore';
import { Header } from './components/common/Header';
import { LobbyView } from './components/lobby/LobbyView';
import { AuctionGameView } from './components/auction/AuctionGameView';
import { ResultGalleryView } from './components/gallery/ResultGalleryView';
import { CodexModal } from './components/codex/CodexModal';
import { APP_VERSION } from './version';

export const App: React.FC = () => {
  const { currentView } = useAuctionStore();

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-gold-500 selection:text-navy-950">
      {/* Top Global Navigation */}
      <Header />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {currentView === 'LOBBY' && <LobbyView />}
        {currentView === 'AUCTION' && <AuctionGameView />}
        {currentView === 'GALLERY' && <ResultGalleryView />}
      </main>

      {/* Global Codex & Achievements Modal */}
      <CodexModal />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-navy-950/90 py-6 text-center text-xs text-slate-500 font-mono">
        <p>SOTHEBY'S ROYALE - WEB AUCTION SIMULATOR v{APP_VERSION}</p>
        <p className="mt-1 text-[11px] text-slate-600">Built with Vite, React 18, TypeScript, TailwindCSS & Zustand</p>
      </footer>
    </div>
  );
};

export default App;
