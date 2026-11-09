// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';
import { PoliceRaidModal } from '../../src/components/auction/PoliceRaidModal';
import {
  loadProfileFromStorage,
  STORAGE_KEY_V2,
  useCareerStore,
} from '../../src/stores/useCareerStore';
import { useAuctionStore } from '../../src/stores/useAuctionStore';
import { MASTER_ITEMS } from '../../src/data/masterItems';
import { Player } from '../../src/types';

const createHumanPlayer = (cash: number): Player => ({
  id: 'player_user',
  name: '나 (컬렉터)',
  isHuman: true,
  avatar: '/assets/images/avatars/avatar_user.webp',
  cash,
  inventory: [],
  chanceCards: [],
  hasTakenLoan: false,
  loanRepaymentAmount: 0,
});

describe('QA-INFRA-001 UI smoke', () => {
  beforeEach(() => {
    localStorage.clear();
    useCareerStore.getState().resetCareer();
    useAuctionStore.getState().tickEngine.stop();
    useAuctionStore.setState({
      currentView: 'LOBBY',
      fsmState: 'IDLE',
      players: [],
      currentItem: null,
      isPoliceRaidModalOpen: false,
    });
  });

  it('renders the lobby and enters the bronze room through the UI', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/브론즈 앤티크 벼룩시장/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /경매장 입장하기/ }));

    expect(await screen.findByText(/경매 개시/)).toBeInTheDocument();
    expect(useAuctionStore.getState().currentView).toBe('AUCTION');
    expect(useAuctionStore.getState().currentTier).toBe('BRONZE');
    useAuctionStore.getState().tickEngine.stop();
  });

  it('opens and closes the codex modal', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /영구 도감/ }));
    expect(await screen.findByText(/30종 역사 유물 도감/)).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: '도감 닫기' }));
    expect(screen.queryByText(/30종 역사 유물 도감/)).not.toBeInTheDocument();
  });

  it('filters the codex to the six black-market items', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /영구 도감/ }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /자정의 비밀 암시장/ }));

    expect(screen.getAllByText('미해금 유물')).toHaveLength(6);
  });

  it('shows the error boundary fallback instead of a blank screen', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const Broken = () => {
      throw new Error('render failed');
    };

    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    );

    expect(screen.getByText('화면을 불러오지 못했습니다')).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  it('repairs an invalid stored room tier and still renders the lobby', () => {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify({
      storageVersion: '2.3.1',
      careerCash: 5000,
      careerNetWorth: 5000,
      vaultItemIds: [],
      vaultItemStates: {},
      unlockedAchievementIds: [],
      highestRoomTierUnlocked: 'PLATINUM',
      totalGamesPlayed: 0,
      totalWins: 0,
      isBankrupt: false,
      bankruptcyCount: 0,
    }));

    const recovered = loadProfileFromStorage();
    useCareerStore.setState({ profile: recovered });

    expect(() => render(<App />)).not.toThrow();
    expect(screen.getAllByText(/브론즈 앤티크 벼룩시장/).length).toBeGreaterThan(0);
  });

  it('returns SAVE_FAILED without clearing the active session when persistence fails', () => {
    useCareerStore.setState((state) => ({
      profile: {
        ...state.profile,
        careerCash: 20000,
        careerNetWorth: 20000,
        activeSession: undefined,
      },
    }));
    expect(useCareerStore.getState().enterRoom('SILVER')).toBe(true);
    const activeSession = useCareerStore.getState().profile.activeSession!;

    const storage = window.localStorage;
    const originalSetItem = storage.setItem.bind(storage);
    const setItemSpy = vi.spyOn(storage, 'setItem').mockImplementation((key: string, value: string) => {
      if (key === STORAGE_KEY_V2) throw new Error('quota exceeded');
      originalSetItem(key, value);
    });

    const result = useCareerStore.getState().commitGameResult({
      sessionId: activeSession.sessionId,
      outcome: 'NORMAL',
      endingCash: 19000,
      acquiredItems: [],
      isWinner: false,
      unlockedAchievementIds: [],
    });

    expect(result.status).toBe('SAVE_FAILED');
    expect(useCareerStore.getState().profile.activeSession?.sessionId).toBe(activeSession.sessionId);
    setItemSpy.mockRestore();
  });

  it('does not expose the hidden real value in the police raid modal', () => {
    const item = { ...MASTER_ITEMS[0], realValue: 123456 };
    const user = createHumanPlayer(100000);

    useAuctionStore.setState({
      players: [user],
      currentItem: item,
      policeRaidState: {
        raidId: 'raid-test',
        isActive: true,
        timeLeft: 5,
        bribeFee: 5000,
        itemPrice: item.startingBid,
        totalCost: 5000 + item.startingBid,
        status: 'RAIDED',
      },
      isPoliceRaidModalOpen: true,
    });

    render(<PoliceRaidModal />);

    expect(screen.queryByText(/실제 가치/)).not.toBeInTheDocument();
    expect(screen.getByText(/총비용/)).toBeInTheDocument();
  });
});
