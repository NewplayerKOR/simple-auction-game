import { expect, test } from '@playwright/test';
import {
  enterRoom,
  expectAuctionResult,
  goToNextRound,
  gotoLobby,
  installGameClock,
  startRound,
} from './helpers';

test.describe('auction flows', () => {
  test('English mode completes five rounds and reaches the result gallery', async ({ page }) => {
    await gotoLobby(page);
    await installGameClock(page);
    await enterRoom(page, 0);

    for (let round = 1; round <= 5; round += 1) {
      await startRound(page);

      if (round === 4) {
        await page.clock.runFor(16_000);
        const closeReveal = page.getByRole('button', { name: /낙찰 확인|유찰 확인/ });
        await expect(closeReveal).toBeVisible();
        await closeReveal.click();
      } else {
        await page.clock.runFor(12_000);
        await expect(
          page.getByRole('button', { name: /다음 라운드 진행|최종 정산 및 시상식/ })
        ).toBeVisible();
      }

      await goToNextRound(page);
    }

    await expectAuctionResult(page);
  });

  test('Dutch mode completes five falling-price rounds and reaches the result gallery', async ({ page }) => {
    await gotoLobby(page);
    await page.getByRole('button', { name: /더치/ }).click();
    await installGameClock(page);
    await enterRoom(page, 0);

    for (let round = 1; round <= 5; round += 1) {
      await startRound(page);
      await page.clock.runFor(60_000);
      await expect(
        page.getByRole('button', { name: /다음 라운드 진행|최종 정산 및 시상식/ })
      ).toBeVisible();
      await goToNextRound(page);
    }

    await expectAuctionResult(page);
  });

  test('sealed bid accepts a manual submission and reveals once', async ({ page }) => {
    await gotoLobby(page);
    await installGameClock(page);
    await enterRoom(page, 0);

    for (let round = 1; round <= 3; round += 1) {
      await startRound(page);
      await page.clock.runFor(12_000);
      await expect(
        page.getByRole('button', { name: /다음 라운드 진행|최종 정산 및 시상식/ })
      ).toBeVisible();
      await goToNextRound(page);
    }

    await startRound(page);
    const input = page.locator('input[type="number"]');
    await expect(input).toBeVisible();
    await input.fill('1000');
    await page.getByRole('button', { name: /봉투 밀봉 제출/ }).click();
    await page.clock.runFor(1_500);

    const closeReveal = page.getByRole('button', { name: /낙찰 확인|유찰 확인/ });
    await expect(closeReveal).toBeVisible();
    await closeReveal.click();
    await expect(
      page.getByRole('button', { name: /다음 라운드 진행|최종 정산 및 시상식/ })
    ).toBeVisible();
  });

  test('sealed bid timeout reveals without manual input', async ({ page }) => {
    await gotoLobby(page);
    await installGameClock(page);
    await enterRoom(page, 0);

    for (let round = 1; round <= 3; round += 1) {
      await startRound(page);
      await page.clock.runFor(12_000);
      await expect(
        page.getByRole('button', { name: /다음 라운드 진행|최종 정산 및 시상식/ })
      ).toBeVisible();
      await goToNextRound(page);
    }

    await startRound(page);
    await page.clock.runFor(16_000);

    const closeReveal = page.getByRole('button', { name: /낙찰 확인|유찰 확인/ });
    await expect(closeReveal).toBeVisible();
    await closeReveal.click();
    await expect(
      page.getByRole('button', { name: /다음 라운드 진행|최종 정산 및 시상식/ })
    ).toBeVisible();
  });
});
