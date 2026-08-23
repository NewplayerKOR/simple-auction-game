/**
 * [더치 역경매 실시간 틱 엔진]
 * - 500ms 주기로 가격을 계단식으로 감산
 * - 타임스탬프 델타 보정(Timestamp Delta Compensation)으로 브라우저 타이머 드리프트 방지
 * - 원자적 선착순 클레임 락(Atomic Claim Lock) 지원
 */
export class DutchTickEngine {
  private intervalId: any = null;
  private lastTickTimestamp: number = 0;
  private isLocked: boolean = false;

  start(
    startPrice: number,
    floorPrice: number,
    dropRatePerSec: number,
    onTick: (price: number) => void,
    onFloor: () => void
  ) {
    this.stop();
    this.isLocked = false;
    let currentPrice = startPrice;
    this.lastTickTimestamp = performance.now();

    // 초기 틱 발행
    onTick(currentPrice);

    this.intervalId = setInterval(() => {
      if (this.isLocked) return;

      const now = performance.now();
      const elapsedSec = (now - this.lastTickTimestamp) / 1000;
      this.lastTickTimestamp = now;

      const dropAmount = Math.max(1, Math.round(dropRatePerSec * elapsedSec));
      currentPrice = Math.max(floorPrice, currentPrice - dropAmount);

      onTick(currentPrice);

      if (currentPrice <= floorPrice) {
        this.stop();
        onFloor();
      }
    }, 500);
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 클레임 시도 시 원자적 락 획득
   * @returns true if lock successfully acquired, false if already claimed/locked
   */
  lock(): boolean {
    if (this.isLocked) return false;
    this.isLocked = true;
    this.stop();
    return true;
  }

  getIsLocked(): boolean {
    return this.isLocked;
  }
}
