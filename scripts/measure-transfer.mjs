import { chromium } from 'playwright';

/**
 * PERF-ASSET-001 초기 로비·경매 진입 전송량 측정.
 * 실행 전 `npm run preview -- --host 127.0.0.1 --port 4173`로 빌드 결과를 띄운다.
 * 응답 본문의 압축 해제 크기를 합산하므로 보수적인 상한으로 사용한다.
 */
const baseURL = process.argv[2] || 'http://127.0.0.1:4173';
const LOBBY_BUDGET = 500 * 1024;
const AUCTION_BUDGET = 1.5 * 1024 * 1024;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const resources = new Map();

page.on('response', async (response) => {
  const url = response.url();
  if (!url.startsWith(baseURL)) return;
  try {
    const body = await response.body();
    resources.set(url, { bytes: body.length, type: response.request().resourceType() });
  } catch {
    // redirect·취소 응답은 집계하지 않는다.
  }
});

const sum = (predicate) =>
  [...resources.values()]
    .filter((entry) => predicate(entry))
    .reduce((total, entry) => total + entry.bytes, 0);

await page.goto(baseURL, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: '경매장 입장하기' }).first().waitFor();
const lobbyBytes = sum(() => true);
const lobbyEntries = resources.size;

resources.clear();
await page.getByRole('button', { name: '경매장 입장하기' }).first().click();
await page.getByRole('button', { name: /경매 개시|더치 역경매 시작|비밀 경매 시작하기/ }).first().waitFor({ timeout: 15_000 });
await page.waitForLoadState('networkidle');
const auctionBytes = sum((entry) => entry.type !== 'document');
const auctionEntries = resources.size;

const report = {
  baseURL,
  lobby: { bytes: lobbyBytes, kib: Number((lobbyBytes / 1024).toFixed(1)), requests: lobbyEntries, budgetKib: 500, withinBudget: lobbyBytes <= LOBBY_BUDGET },
  auction: { bytes: auctionBytes, kib: Number((auctionBytes / 1024).toFixed(1)), requests: auctionEntries, budgetKib: 1536, withinBudget: auctionBytes <= AUCTION_BUDGET },
};
console.log(JSON.stringify(report, null, 2));

await browser.close();
if (!report.lobby.withinBudget || !report.auction.withinBudget) process.exit(1);
