import { expect, test } from '@playwright/test';
import { MASTER_ITEMS } from '../../src/data/masterItems';
import { MASTER_ACHIEVEMENTS } from '../../src/data/masterAchievements';
import { driveStore, enterRoom, seedCareer } from './helpers';

const imageFailures: string[] = [];

test.beforeEach(async ({ page }) => {
  imageFailures.length = 0;
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('/assets/images/') && response.status() >= 400) {
      imageFailures.push(`${response.status()} ${url}`);
    }
  });
});

test.describe('PERF-ASSET-001 optimized asset rendering', () => {
  test('lobby, codex, achievements, and fonts render every asset without 404', async ({ page }) => {
    await seedCareer(page, {
      vaultItemIds: MASTER_ITEMS.map((item) => item.id),
      unlockedAchievementIds: MASTER_ACHIEVEMENTS.map((achievement) => achievement.id),
      highestRoomTierUnlocked: 'DIAMOND',
    });

    const backgroundLoaded = await page.evaluate(() =>
      performance.getEntriesByType('resource').some((entry) => entry.name.includes('/backgrounds/bg_lobby'))
    );
    expect(backgroundLoaded).toBe(true);
    expect(await page.evaluate(() => document.fonts.check('700 16px Cinzel'))).toBe(true);

    await page.getByRole('button', { name: /30\/30/ }).click();
    await expect(page.getByText(/30종 역사 유물 도감/)).toBeVisible();

    const modalScroller = page.locator('.fixed.inset-0 .overflow-y-auto').first();
    for (let index = 0; index < 12; index += 1) {
      await modalScroller.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
    }

    const itemImages = page.locator('img[src*="/assets/images/items/"]');
    await expect(itemImages).toHaveCount(30);
    const itemStates = await itemImages.evaluateAll((images) =>
      images.map((element) => {
        const image = element as HTMLImageElement;
        return {
          alt: image.getAttribute('alt'),
          width: image.naturalWidth,
          complete: image.complete,
        };
      })
    );
    expect(itemStates.filter((state) => !state.complete || state.width === 0)).toEqual([]);

    await page.getByRole('button', { name: /달성 업적/ }).click();
    await modalScroller.evaluate((element) => {
      element.scrollTop = 0;
    });
    for (let index = 0; index < 6; index += 1) {
      await modalScroller.evaluate((element) => {
        element.scrollTop += element.clientHeight;
      });
    }
    const achievementImages = page.locator('img[src*="/assets/images/achievements/"]');
    await expect(achievementImages).toHaveCount(6);
    await expect
      .poll(async () =>
        achievementImages.evaluateAll((images) =>
          images.every((element) => {
            const image = element as HTMLImageElement;
            return image.complete && image.naturalWidth > 0;
          })
        )
      )
      .toBe(true);
    expect(imageFailures).toEqual([]);
  });

  test('auction, market event, chance cards, and gallery render optimized assets', async ({ page }) => {
    await seedCareer(page);
    await enterRoom(page, 1);

    const auctionItem = page.locator('img[src*="/assets/images/items/"]').first();
    await expect(auctionItem).toBeVisible();
    expect(await auctionItem.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

    await driveStore(
      page,
      `const events = await import('/src/data/masterEvents.ts');
       module.useAuctionStore.setState({
         activeMarketEvent: events.MASTER_EVENTS[0],
         isMarketEventModalOpen: true,
       });
       return true;`
    );
    const eventImage = page.locator('img[src*="/assets/images/events/"]').first();
    await expect(eventImage).toBeVisible();
    expect(await eventImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.getByRole('button', { name: /시장 속보 확인/ }).click();

    await driveStore(
      page,
      `const cards = await import('/src/data/chanceCards.ts');
       module.useAuctionStore.setState((state) => ({
         players: state.players.map((player) => player.isHuman
           ? { ...player, chanceCards: Object.values(cards.CHANCE_CARDS_MASTER).map((card) => ({ ...card, isUsed: false })) }
           : player),
       }));
       return true;`
    );
    const cardImages = page.locator('img[src*="/assets/images/cards/"]');
    await expect(cardImages).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await cardImages.nth(index).scrollIntoViewIfNeeded();
    }
    await expect
      .poll(async () =>
        cardImages.evaluateAll((images) =>
          images.every((element) => {
            const image = element as HTMLImageElement;
            return image.complete && image.naturalWidth > 0;
          })
        )
      )
      .toBe(true);

    await driveStore(
      page,
      `const items = await import('/src/data/masterItems.ts');
       module.useAuctionStore.setState((state) => ({
         players: state.players.map((player) => player.isHuman
           ? { ...player, inventory: [items.MASTER_ITEMS[0], items.MASTER_ITEMS[1]] }
           : player),
       }));
       module.useAuctionStore.getState().finishGame();
       return true;`
    );

    await expect(page.getByText(/FINAL AUCTION CEREMONY|이번 매치 순자산/).first()).toBeVisible();
    const galleryBackgroundLoaded = await page.evaluate(() =>
      performance.getEntriesByType('resource').some((entry) => entry.name.includes('/backgrounds/bg_museum_gallery'))
    );
    expect(galleryBackgroundLoaded).toBe(true);
    const galleryImages = page.locator('img[src*="/assets/images/"]');
    const galleryCount = await galleryImages.count();
    for (let index = 0; index < galleryCount; index += 1) {
      await galleryImages.nth(index).scrollIntoViewIfNeeded();
    }
    await expect
      .poll(async () =>
        galleryImages.evaluateAll((images) =>
          images.every((element) => {
            const image = element as HTMLImageElement;
            return image.complete && image.naturalWidth > 0;
          })
        )
      )
      .toBe(true);
    expect(imageFailures).toEqual([]);
  });
});
