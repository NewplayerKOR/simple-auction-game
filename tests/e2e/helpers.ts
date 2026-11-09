import { expect, Page } from '@playwright/test';

export const STORAGE_KEY = 'SIMPLE_AUCTION_CAREER_V2';

export const BASE_PROFILE = {
  storageVersion: '2.3.1',
  careerCash: 200_000,
  careerNetWorth: 200_000,
  vaultItemIds: [] as string[],
  vaultItemStates: {},
  unlockedAchievementIds: [] as string[],
  highestRoomTierUnlocked: 'DIAMOND',
  blackVipTicketCount: 0,
  totalGamesPlayed: 0,
  totalWins: 0,
  isBankrupt: false,
  bankruptcyCount: 0,
  lastUpdatedTimestamp: Date.now(),
};

export async function gotoLobby(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.goto('/');
  await expect(page.getByText("SOTHEBY'S ROYALE").first()).toBeVisible();
}

export async function seedCareer(
  page: Page,
  overrides: Partial<typeof BASE_PROFILE> = {}
): Promise<void> {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });
  await page.goto('/');
  const profile = { ...BASE_PROFILE, ...overrides, lastUpdatedTimestamp: Date.now() };
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
    { key: STORAGE_KEY, value: profile }
  );
  await page.reload();
  await expect(page.getByText("SOTHEBY'S ROYALE").first()).toBeVisible();
}

export async function installGameClock(page: Page): Promise<void> {
  await page.clock.install();
}

export async function enterRoom(page: Page, enabledRoomIndex = 0): Promise<void> {
  await page.getByRole('button', { name: '경매장 입장하기' }).nth(enabledRoomIndex).click();
  await expect(
    page.getByRole('button', { name: /경매 개시|더치 역경매 시작|비밀 경매 시작하기/ })
  ).toBeVisible();
}

export async function closeMarketEventIfOpen(page: Page): Promise<void> {
  const button = page.getByRole('button', { name: /시장 속보 확인 및 경매 계속하기/ });
  if ((await button.count()) > 0 && (await button.isVisible())) {
    await button.click();
  }
}

export async function startRound(page: Page): Promise<void> {
  await closeMarketEventIfOpen(page);
  await page
    .getByRole('button', { name: /경매 개시|더치 역경매 시작|비밀 경매 시작하기/ })
    .click();
}

export async function goToNextRound(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: /다음 라운드 진행|최종 정산 및 시상식/ })
    .click();
}

export async function readCareerProfile(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as Record<string, unknown> : {};
  }, STORAGE_KEY);
}

export async function driveStore(page: Page, command: string): Promise<unknown> {
  return page.evaluate(`(async () => {
    const module = await import('/src/stores/useAuctionStore.ts');
    ${command}
  })()`);
}

export async function expectAuctionResult(page: Page): Promise<void> {
  await expect(
    page.getByText(/FINAL AUCTION CEREMONY|이번 매치 순자산/).first()
  ).toBeVisible();
}
