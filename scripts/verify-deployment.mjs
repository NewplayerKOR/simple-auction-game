import { chromium } from 'playwright';

/**
 * 배포 미리보기 검증 (REPO-001)
 * - 하위 경로 배포에서 문서·이미지·폰트·스크립트 404/5xx가 없는지 확인한다.
 * - favicon, robots.txt, meta description, title을 확인한다.
 * - 실행: npm run verify:deploy -- http://127.0.0.1:4174/simple-auction-game/
 */
const target = process.argv[2];
if (!target) {
  console.error('사용법: npm run verify:deploy -- <URL>');
  process.exit(1);
}

const baseUrl = target.endsWith('/') ? target : `${target}/`;
const basePath = new URL(baseUrl).pathname;
const failures = [];
const responses = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

page.on('response', (response) => {
  const request = response.request();
  const url = response.url();
  const type = request.resourceType();
  if (!url.startsWith(new URL(baseUrl).origin)) return;
  if (!['document', 'image', 'font', 'script', 'stylesheet'].includes(type)) return;
  responses.push({ url, status: response.status(), type });
  if (response.status() >= 400) {
    failures.push(`${response.status()} ${type} ${url}`);
  }
});

page.on('requestfailed', (request) => {
  if (request.url().startsWith(new URL(baseUrl).origin)) {
    failures.push(`FAILED ${request.resourceType()} ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`);
  }
});

try {
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  if (!response || response.status() >= 400) {
    failures.push(`문서 응답 실패: ${response?.status() ?? 'no response'}`);
  }

  const metadata = await page.evaluate(() => ({
    title: document.title.trim(),
    description: document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '',
    lang: document.documentElement.lang,
    iconHref: document.querySelector('link[rel="icon"]')?.getAttribute('href') ?? '',
  }));

  if (!metadata.title) failures.push('title이 비어 있음');
  if (!metadata.description) failures.push('meta description이 비어 있음');
  if (!metadata.lang) failures.push('html lang이 비어 있음');

  const iconUrl = new URL(metadata.iconHref, baseUrl).toString();
  const iconResponse = await page.request.get(iconUrl);
  if (!iconResponse.ok()) failures.push(`favicon ${iconResponse.status()} ${iconUrl}`);

  const robotsUrl = new URL('robots.txt', baseUrl).toString();
  const robotsResponse = await page.request.get(robotsUrl);
  const robotsBody = await robotsResponse.text();
  if (!robotsResponse.ok()) {
    failures.push(`robots.txt ${robotsResponse.status()} ${robotsUrl}`);
  } else if (/^\s*Disallow:\s*\/\s*$/im.test(robotsBody)) {
    failures.push('robots.txt가 전체 크롤링을 차단함');
  }

  await page.getByText("SOTHEBY'S ROYALE").first().waitFor({ timeout: 10_000 });

  const openCodex = page.getByRole('button', { name: /영구 도감|0\/30/ }).first();
  if ((await openCodex.count()) > 0) {
    await openCodex.click();
    await page.getByText(/30종 역사 유물 도감/).waitFor({ timeout: 10_000 });
  }

  // lazy 이미지까지 실제 요청을 발생시켜 하위 경로 404를 빠짐없이 수집한다.
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map((image) => image.decode().catch(() => undefined))
    );
  });
  await page.waitForLoadState('networkidle');

  const closeCodex = page.getByRole('button', { name: /도감 닫기/ }).first();
  if ((await closeCodex.count()) > 0) {
    await closeCodex.click();
  }

  const enterRoom = page.getByRole('button', { name: /경매장 입장하기/ }).first();
  if ((await enterRoom.count()) > 0 && (await enterRoom.isEnabled())) {
    await enterRoom.click();
    await page
      .getByRole('button', { name: /경매 개시|더치 역경매 시작|비밀 경매 시작하기/ })
      .first()
      .waitFor({ timeout: 10_000 });
    await page.evaluate(async () => {
      await Promise.all(
        [...document.images].map((image) => image.decode().catch(() => undefined))
      );
    });
    await page.waitForLoadState('networkidle');
  }

  const outsideBase = responses.filter(({ url }) => {
    const pathname = new URL(url).pathname;
    return !pathname.startsWith(basePath);
  });
  if (outsideBase.length > 0) {
    failures.push(`base 경로 밖 요청: ${outsideBase.map(({ url }) => url).join(', ')}`);
  }

  const summary = {
    baseUrl,
    basePath,
    documentStatus: response?.status() ?? null,
    requests: responses.length,
    images: responses.filter(({ type }) => type === 'image').length,
    metadata,
    failures,
  };
  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = failures.length === 0 ? 0 : 1;
} catch (error) {
  failures.push(`검증 중 예외: ${error instanceof Error ? error.message : String(error)}`);
  console.log(JSON.stringify({ baseUrl, basePath, failures }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
