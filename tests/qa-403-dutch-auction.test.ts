import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DutchTickEngine } from '../src/services/dutchTickEngine';
import { AiBotService } from '../src/services/aiBotService';
import { MASTER_ITEMS } from '../src/data/masterItems';


describe('DEV-305, DEV-306, DEV-307: Dutch Auction & AI Bot 밸런싱', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('DEV-305: DutchTickEngine은 500ms 주기로 가격을 차감하고 바닥가 도달 시 정지해야 한다', () => {
    const engine = new DutchTickEngine();
    const ticks: number[] = [];
    let floorReached = false;

    engine.start(
      1000,
      500,
      100, // 초당 100 차감 (500ms당 약 50 차감)
      (price) => ticks.push(price),
      () => { floorReached = true; }
    );

    expect(ticks[0]).toBe(1000);

    // 1초 경과 (2틱)
    vi.advanceTimersByTime(1000);
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(ticks[ticks.length - 1]).toBeLessThan(1000);

    // 6초 경과 (바닥가 500 도달)
    vi.advanceTimersByTime(6000);
    expect(floorReached).toBe(true);
    expect(ticks[ticks.length - 1]).toBe(500);

    engine.stop();
  });

  it('DEV-305: 원자적 락(Atomic Claim Lock)을 통해 단 1인만 선착순 낙찰을 확정할 수 있어야 한다', () => {
    const engine = new DutchTickEngine();
    engine.start(1000, 500, 100, () => {}, () => {});

    // 첫 번째 구매 시도 -> 락 획득 성공
    const firstClaim = engine.lock();
    expect(firstClaim).toBe(true);
    expect(engine.getIsLocked()).toBe(true);

    // 동시/이후 구매 시도 -> 락 획득 실패 (차단)
    const secondClaim = engine.lock();
    expect(secondClaim).toBe(false);
  });

  it('DEV-307: spawnTierBots(tier)는 룸 티어별 자금 범위 내에서 봇 자금을 동적 생성해야 한다', () => {
    const bronzeBots = AiBotService.spawnTierBots('BRONZE');
    expect(bronzeBots.length).toBe(3);
    bronzeBots.forEach((bot) => {
      expect(bot.cash).toBeGreaterThanOrEqual(4000);
      expect(bot.cash).toBeLessThanOrEqual(6000);
      expect(bot.personaAggressiveness).toBe(0.8);
    });

    const diamondBots = AiBotService.spawnTierBots('DIAMOND');
    expect(diamondBots.length).toBe(3);
    diamondBots.forEach((bot) => {
      expect(bot.cash).toBeGreaterThanOrEqual(200000);
      expect(bot.cash).toBeLessThanOrEqual(400000);
      expect(bot.personaAggressiveness).toBe(1.5);
    });
  });

  it('DEV-306: 더치 역경매 봇 WTP 평가 및 지불 용의 충족 시 구매 트리거가 발생해야 한다', () => {
    const sampleItem = MASTER_ITEMS[0]; // Real value ~ ,000, dutchStart: 3200, floor: 900
    const bots = AiBotService.spawnTierBots('BRONZE');
    const onBotClaim = vi.fn();

    // 시작가(3200)에서는 지불 용의(WTP)를 초과하여 아무도 사지 않음
    AiBotService.evaluateDutchBots(sampleItem.dutchStartPrice, sampleItem, bots, 'BRONZE', onBotClaim);
    vi.advanceTimersByTime(1000);
    expect(onBotClaim).not.toHaveBeenCalled();

    // 바닥가 부근(1000)으로 하락 시 봇의 WTP 범위에 진입하여 구매 트리거 발생
    AiBotService.evaluateDutchBots(1000, sampleItem, bots, 'BRONZE', onBotClaim);
    vi.advanceTimersByTime(800); // 200~700ms 딜레이 후 호출됨
    expect(onBotClaim).toHaveBeenCalled();
  });
});
