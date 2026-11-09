# 개발·검증·배포 가이드

이 문서는 Simple Auction Game의 로컬 실행, 테스트, 빌드, 배포 절차를 기록합니다. 프로젝트 소개는 [`README.md`](./README.md)를 따릅니다.

## 1. 요구 사항

- Node.js **26 이상** (`.nvmrc` 기준)
- npm **11 이상**
- Chromium 계열 브라우저 (Playwright E2E 실행 시 설치)

Node 26의 실험적 Web Storage 경고를 피하기 위해 테스트 스크립트는 `NODE_OPTIONS=--no-experimental-webstorage`를 사용합니다. 일반 개발·빌드에는 별도 설정이 필요하지 않습니다.

```bash
node --version   # v26.x
npm --version    # 11.x
```

## 2. 설치

```bash
git clone https://github.com/NewplayerKOR/simple-auction-game.git
cd simple-auction-game
npm ci
```

lockfile(`package-lock.json`)을 기준으로 설치합니다. 의존성을 변경할 때만 `npm install`을 사용하고, 변경된 lockfile을 함께 커밋합니다.

## 3. 개발과 검증

```bash
npm run dev          # http://localhost:3000
npm run typecheck    # 소스·테스트 TypeScript 검사
npm test             # Vitest 단위·통합·UI 테스트
npm run test:coverage
npm run test:e2e:install  # 최초 1회 Chromium 설치
npm run test:e2e     # Playwright 브라우저 E2E
npm run check:assets # public 자산 예산·WebP·참조 무결성
npm run build        # 프로덕션 빌드 (dist/)
```

전체 검증 순서는 CI와 동일하게 `typecheck → check:assets → test:coverage → build → build:subpath → npm audit → test:e2e`를 권장합니다. CI는 하위 경로 빌드 후 루트 빌드를 복원하고, `npx playwright install --with-deps chromium` 후 E2E를 실행합니다.

### E2E 참고

- Playwright는 `127.0.0.1:4173`에서 Vite 개발 서버를 자동으로 시작합니다.
- 실패 시 `playwright-report/`와 `test-results/`에 trace·screenshot·video가 남습니다.
- CI에서는 `npm run test:e2e` 전에 `npx playwright install --with-deps chromium`을 실행합니다.

## 4. 빌드와 배포

### 루트 경로 배포

```bash
npm run build
npm run preview -- --port 4173
```

### 하위 경로 배포

`VITE_BASE_PATH`를 슬래시로 시작·끝나는 경로로 지정합니다.

```bash
VITE_BASE_PATH=/simple-auction-game/ npm run build
VITE_BASE_PATH=/simple-auction-game/ npm run preview -- --port 4173
# 확인: http://127.0.0.1:4173/simple-auction-game/
```

Windows PowerShell 예시:

```powershell
$env:VITE_BASE_PATH='/simple-auction-game/'
npm run build
npm run preview -- --port 4173
```

`npm run build:subpath`는 `/simple-auction-game/` 기준 빌드를 수행하는 단축 명령입니다. 이미지·폰트·JS 경로는 빌드 시 base가 적용되며, 런타임 문자열 경로는 `src/services/assetService.ts`의 `assetUrl()`을 사용합니다.

### 배포 후 검증

```bash
npm run preview -- --port 4173
npm run verify:deploy -- http://127.0.0.1:4173/
```

하위 경로는 실행 중인 preview의 base와 같은 URL을 넘깁니다.

```bash
npm run verify:deploy -- http://127.0.0.1:4173/simple-auction-game/
```

검증 항목은 문서·이미지·폰트·스크립트 404/5xx, favicon, robots.txt, title, meta description, base 경로 이탈 요청입니다. 실패 시 JSON의 `failures`에 원인이 출력되고 종료 코드가 1이 됩니다.

`public/robots.txt`는 검색·AI 크롤러의 수집을 막는 정책을 사용합니다. `verify:deploy`는 robots.txt 응답과 `User-agent: *` 규칙 존재를 확인합니다.

### Vercel

- `vercel.json`에 Vite 프레임워크, `npm ci`, `npm run build`, `dist` 출력, 보안 헤더, 자산 캐시 정책을 정의했습니다.
- 프로젝트의 Node.js 버전은 `package.json`의 `engines`와 `.nvmrc`를 따릅니다.
- 루트 배포는 `VITE_BASE_PATH`를 비우거나 `/`로 둡니다. 하위 경로 배포는 Vercel 환경 변수에 `/simple-auction-game/` 형식으로 지정합니다.
- Vercel 프로젝트가 일시 중지 상태이면 배포·헤더 확인은 프로젝트 재개 후 수행합니다. 이는 저장소 검증 실패가 아닙니다.

## 5. CI

`.github/workflows/qa.yml`은 `main` push, pull request, 수동 실행에서 다음을 수행합니다.

1. Node 26 설치 및 `npm ci`
2. `typecheck`
3. 자산 무결성 검사
4. Vitest 커버리지
5. 프로덕션 빌드 및 하위 경로 빌드
6. `npm audit` 전체·프로덕션 의존성 검사
7. Playwright Chromium E2E
8. 실패 시 coverage·report·`dist` 아티팩트 업로드

CI가 실패하면 로그의 첫 실패 단계를 확인하고, 아티팩트의 `playwright-report/`·`test-results/`를 우선 확인합니다.

## 6. 버전 태그와 릴리즈

1. `package.json` 버전과 릴리즈 노트를 갱신합니다.
2. 전체 검증을 통과시킵니다.
3. 커밋 후 annotated tag를 만듭니다.

```bash
npm version patch --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore(release): v2.3.2"
git tag -a v2.3.2 -m "v2.3.2"
git push origin main --follow-tags
```

버전 태그는 `vMAJOR.MINOR.PATCH` 형식을 사용합니다. 릴리즈 승인 판정 절차는 [`.md/root/TASKS.md`](./.md/root/TASKS.md)를 따르고, v2.3.1 `REL-001` 결과는 [`.md/root/archive/TASKS_PHASE_01.md`](./.md/root/archive/TASKS_PHASE_01.md) 13절에 기록되어 있습니다.

v2.3.1은 현재 배포 가능한 상태입니다. 실제 태그·릴리즈 노트·배포는 별도로 실행합니다.

## 7. 문서

- 프로젝트 소개: [`README.md`](./README.md)
- 현재 상태: [`.md/specs/PROJECT_STATE.md`](./.md/specs/PROJECT_STATE.md)
- 작업 보드: [`.md/root/TASKS.md`](./.md/root/TASKS.md)
- 기능 명세: [`.md/root/FEATURES.md`](./.md/root/FEATURES.md)
- 제품 요구사항: [`.md/specs/PRD.md`](./.md/specs/PRD.md)
- 아키텍처: [`.md/specs/ARCHITECTURE.md`](./.md/specs/ARCHITECTURE.md)
- QA 계획: [`.md/specs/QA_TEST_PLAN.md`](./.md/specs/QA_TEST_PLAN.md)
