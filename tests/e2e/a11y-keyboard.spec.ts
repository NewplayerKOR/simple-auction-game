import AxeBuilder from '@axe-core/playwright';
import { expect, Page, Locator } from '@playwright/test';
import { test } from '@playwright/test';
import {
  driveStore,
  enterRoom,
  expectAuctionResult,
  gotoLobby,
  installGameClock,
  seedCareer,
} from './helpers';

const seriousOrCritical = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
  violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');

const expectNoAxeViolations = async (page: Page, label: string) => {
  const results = await new AxeBuilder({ page }).analyze();
  await test.info().attach(`axe-${label}.json`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });
  expect(seriousOrCritical(results.violations), label).toEqual([]);
};

const pressEnter = async (page: Page, target: Locator) => {
  await target.focus();
  await page.keyboard.press('Enter');
};

const pressNextRound = async (page: Page) => {
  await pressEnter(
    page,
    page.getByRole('button', { name: /다음 라운드 진행|최종 정산 및 시상식/ })
  );
};

const closeMarketEventByKeyboard = async (page: Page) => {
  const button = page.getByRole('button', { name: /시장 속보 확인 및 경매 계속하기/ });
  if ((await button.count()) > 0 && (await button.isVisible())) {
    await pressEnter(page, button);
  }
};

test.describe('A11Y-001 accessibility and keyboard flow', () => {
  test('lobby, codex, auction, and result have zero serious/critical axe violations', async ({ page }) => {
    test.slow();
    await seedCareer(page);

    await expectNoAxeViolations(page, 'lobby');

    await page.getByRole('button', { name: /영구 도감/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoAxeViolations(page, 'codex');
    await page.getByRole('button', { name: '도감 닫기' }).click();

    await enterRoom(page, 0);
    await expectNoAxeViolations(page, 'auction');

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
    await expectAuctionResult(page);
    await expectNoAxeViolations(page, 'result');
  });

  test('keyboard only completes five rounds and returns focus from the codex', async ({ page }) => {
    test.slow();
    await gotoLobby(page);
    await installGameClock(page);

    await pressEnter(page, page.getByRole('button', { name: '경매장 입장하기' }).first());
    await expect(page.getByRole('button', { name: /경매 개시/ })).toBeVisible();

    for (let round = 1; round <= 5; round += 1) {
      await closeMarketEventByKeyboard(page);
      await pressEnter(
        page,
        page.getByRole('button', { name: /경매 개시|더치 역경매 시작|비밀 경매 시작하기/ })
      );

      if (round === 1) {
        await pressEnter(page, page.getByRole('button', { name: /^입찰하기/ }));
        await expect(page.getByText(/최고 입찰자/)).toBeVisible();
      }

      if (round === 4) {
        const input = page.locator('input[type="number"]');
        await input.focus();
        await page.keyboard.type('1000');
        await pressEnter(page, page.getByRole('button', { name: /봉투 밀봉 제출/ }));
        await page.clock.runFor(1_500);
        await pressEnter(page, page.getByRole('button', { name: /낙찰 확인|유찰 확인/ }));
      } else {
        await page.clock.runFor(12_000);
      }

      await pressNextRound(page);
    }

    await expectAuctionResult(page);

    const codexButton = page.getByRole('button', { name: /영구 도감 & 업적 확인하기/ });
    await pressEnter(page, codexButton);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);

    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(codexButton).toBeFocused();
  });

  test('header home requires confirmation during an auction and cancel keeps the session', async ({ page }) => {
    await seedCareer(page);
    await enterRoom(page, 0);

    const logo = page.getByRole('button', { name: /SOTHEBY'S ROYALE/ }).first();
    await pressEnter(page, logo);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('경매를 포기하고 로비로 돌아갈까요?');

    await pressEnter(page, page.getByRole('button', { name: '계속 경매' }));
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: /경매 개시/ })).toBeVisible();

    await pressEnter(page, logo);
    await pressEnter(page, page.getByRole('button', { name: '경매 포기' }));
    await expect(page.getByText('브론즈 앤티크 벼룩시장').first()).toBeVisible();
  });

  test('career and codex reset require confirmation', async ({ page }) => {
    await gotoLobby(page);

    await pressEnter(page, page.getByRole('button', { name: '커리어 전체 초기화' }));
    await expect(page.getByRole('dialog')).toContainText('커리어를 완전히 초기화할까요?');
    await pressEnter(page, page.getByRole('button', { name: '취소' }));
    await expect(page.getByRole('dialog')).toBeHidden();

    await pressEnter(page, page.getByRole('button', { name: /영구 도감/ }));
    await expect(page.getByRole('dialog')).toBeVisible();
    await pressEnter(page, page.getByRole('button', { name: /도감 초기화/ }));
    await expect(page.getByRole('dialog')).toContainText('도감과 커리어를 초기화할까요?');
    await pressEnter(page, page.getByRole('button', { name: '취소' }));
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('audio settings persist across reload', async ({ page }) => {
    await gotoLobby(page);
    await pressEnter(page, page.getByRole('button', { name: '오디오 환경 설정 열기' }));
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.locator('#sfx-volume').fill('0.4');
    await page.locator('#bgm-volume').fill('0.2');
    await pressEnter(page, page.getByRole('button', { name: '설정 완료' }));

    await page.reload();
    await page.getByText("SOTHEBY'S ROYALE").first().waitFor();
    await pressEnter(page, page.getByRole('button', { name: '오디오 환경 설정 열기' }));
    await expect(page.locator('#sfx-volume')).toHaveValue('0.4');
    await expect(page.locator('#bgm-volume')).toHaveValue('0.2');
  });

  test('reduced-motion keeps required information visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoLobby(page);

    expect(
      await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ).toBe(true);
    expect(await page.getByText('나만의 옥션 커리어 프로필').isVisible()).toBe(true);
    expect(await page.getByText('5단계 경매장 & 자정의 비밀 암시장').isVisible()).toBe(true);

    const duration = await page.evaluate(() => {
      const element = document.querySelector('header');
      return element ? getComputedStyle(element).transitionDuration : null;
    });
    expect(duration).not.toBeNull();
    expect(parseFloat(duration as string)).toBeLessThanOrEqual(0.001);
  });
});
