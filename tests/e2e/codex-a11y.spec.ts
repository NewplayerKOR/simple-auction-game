import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { gotoLobby } from './helpers';

const seriousOrCritical = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
  violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');

test.describe('codex and accessibility baseline', () => {
  test('codex shows 30 items and filters to 6 black-market items', async ({ page }) => {
    await gotoLobby(page);
    await page.getByRole('button', { name: /0\/30/ }).click();
    await expect(page.getByText(/30종 역사 유물 도감/)).toBeVisible();

    await page.getByRole('dialog').getByRole('button', { name: /자정의 비밀 암시장/ }).click();
    await expect(page.getByText('미해금 유물')).toHaveCount(6);
  });

  test('lobby has zero serious or critical axe violations', async ({ page }) => {
    await gotoLobby(page);
    const results = await new AxeBuilder({ page }).analyze();
    await test.info().attach('axe-lobby.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
    expect(seriousOrCritical(results.violations)).toEqual([]);
  });

  test('codex has zero serious or critical axe violations', async ({ page }) => {
    await gotoLobby(page);
    await page.getByRole('button', { name: /0\/30/ }).click();
    await expect(page.getByText(/30종 역사 유물 도감/)).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    await test.info().attach('axe-codex.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
    expect(seriousOrCritical(results.violations)).toEqual([]);
  });
});

test.describe('mobile codex', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('keeps the six room filters in a horizontal scroller at 390x844', async ({ page }) => {
    await gotoLobby(page);
    await page.getByRole('button', { name: /0\/30/ }).click();
    await expect(page.getByText(/30종 역사 유물 도감/)).toBeVisible();

    const filterGroup = page.getByRole('group', { name: '도감 룸 티어 필터' });
    await expect(filterGroup).toBeVisible();
    const dimensions = await filterGroup.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      buttonTops: [...element.querySelectorAll('button')].map((button) =>
        Math.round(button.getBoundingClientRect().top)
      ),
    }));

    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
    expect(new Set(dimensions.buttonTops).size).toBe(1);
    await page.getByRole('dialog').getByRole('button', { name: /자정의 비밀 암시장/ }).click();
    await expect(page.getByText('미해금 유물')).toHaveCount(6);
  });
});
