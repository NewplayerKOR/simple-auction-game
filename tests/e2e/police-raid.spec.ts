import { expect, test } from '@playwright/test';
import {
  driveStore,
  enterRoom,
  installGameClock,
  readCareerProfile,
  seedCareer,
} from './helpers';

test.describe('black-market police raid', () => {
  test('escape returns to the lobby and survives reload', async ({ page }) => {
    await seedCareer(page);
    await installGameClock(page);
    await enterRoom(page, 4);

    await driveStore(page, 'module.useAuctionStore.getState().triggerPoliceRaid(); return true;');
    await expect(page.getByText(/경찰 긴급 급습/)).toBeVisible();
    await page.getByRole('button', { name: /즉시 탈출/ }).click();

    await expect(page.getByText('브론즈 앤티크 벼룩시장').first()).toBeVisible();
    const profile = await readCareerProfile(page);
    expect(profile.careerCash).toBe(190_000);

    await page.reload();
    await expect(page.getByText("SOTHEBY'S ROYALE").first()).toBeVisible();
    const afterReload = await readCareerProfile(page);
    expect(afterReload.careerCash).toBe(190_000);
  });

  test('bribe wins the item, settles normally, and survives reload', async ({ page }) => {
    await seedCareer(page);
    await installGameClock(page);
    await enterRoom(page, 4);

    await driveStore(page, 'module.useAuctionStore.getState().triggerPoliceRaid(); return true;');
    await expect(page.getByText(/경찰 긴급 급습/)).toBeVisible();
    const totalCost = await page.evaluate(`(async () => {
      const module = await import('/src/stores/useAuctionStore.ts');
      return module.useAuctionStore.getState().policeRaidState.totalCost;
    })()`) as number;

    await page.getByRole('button', { name: /뇌물 \+ 낙찰/ }).click();
    await driveStore(page, 'module.useAuctionStore.getState().finishGame(); return true;');
    await expect(page.getByText(/FINAL AUCTION CEREMONY|이번 매치 순자산/).first()).toBeVisible();

    const profile = await readCareerProfile(page);
    // First black-market item is item_bm_01, whose END_GAME_CASH_FEE curse costs $1,000.
    expect(profile.careerCash).toBe(190_000 - totalCost - 1_000);
    expect((profile.vaultItemIds as string[]).length).toBe(1);

    await page.reload();
    await expect(page.getByText("SOTHEBY'S ROYALE").first()).toBeVisible();
    const afterReload = await readCareerProfile(page);
    expect(afterReload.careerCash).toBe(190_000 - totalCost - 1_000);
  });

  test('arrest confiscates all session cash and survives reload', async ({ page }) => {
    await seedCareer(page);
    await installGameClock(page);
    await enterRoom(page, 4);

    await driveStore(page, 'module.useAuctionStore.getState().triggerPoliceRaid(); return true;');
    await expect(page.getByText(/경찰 긴급 급습/)).toBeVisible();
    await page.clock.runFor(6_000);

    await expect(page.getByText('브론즈 앤티크 벼룩시장').first()).toBeVisible();
    const profile = await readCareerProfile(page);
    expect(profile.careerCash).toBe(0);
    expect(profile.totalGamesPlayed).toBe(1);

    await page.reload();
    await expect(page.getByText("SOTHEBY'S ROYALE").first()).toBeVisible();
    const afterReload = await readCareerProfile(page);
    expect(afterReload.careerCash).toBe(0);
  });
});
