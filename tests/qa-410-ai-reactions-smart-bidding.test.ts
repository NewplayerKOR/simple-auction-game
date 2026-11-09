import { describe, it, expect } from 'vitest';
import { AiBotService } from '../src/services/aiBotService';
import { MASTER_BOTS } from '../src/data/masterBots';
import { MASTER_ITEMS } from '../src/data/masterItems';
import { BOT_FORGERY_REACTIONS } from '../src/data/constants';
import { Player } from '../src/types';

const makeBot = (persona: 'WARREN' | 'DOGE' | 'PICASSO', cash = 100000): Player => ({
  ...MASTER_BOTS.find((b) => b.persona === persona)!,
  cash,
  inventory: [],
  chanceCards: [],
  hasTakenLoan: false,
  loanRepaymentAmount: 0,
});

describe('QA-410: 지능형 AI 입찰 (Smart Early Fold) & 위작 피격 리액션 대사', () => {
  it('봇 위작 피격 시 페르소나별 분노/절망 대사가 정상 매핑되어야 한다', () => {
    const dogeBot = makeBot('DOGE');
    const warrenBot = makeBot('WARREN');
    const picassoBot = makeBot('PICASSO');

    const dogeReaction = AiBotService.getReactionDialogue(dogeBot, 'FORGERY');
    const warrenReaction = AiBotService.getReactionDialogue(warrenBot, 'FORGERY');
    const picassoReaction = AiBotService.getReactionDialogue(picassoBot, 'FORGERY');

    expect(BOT_FORGERY_REACTIONS.DOGE).toContain(dogeReaction);
    expect(BOT_FORGERY_REACTIONS.WARREN).toContain(warrenReaction);
    expect(BOT_FORGERY_REACTIONS.PICASSO).toContain(picassoReaction);
  });

  it('워렌(WARREN)은 감정 최소가 이상으로 호가가 오르면 즉시 입찰을 조기 포기(Fold)해야 한다', () => {
    const warrenBot = makeBot('WARREN');
    const item = MASTER_ITEMS[0]; // estimatedMin: 1500

    const decision = AiBotService.evaluateBid(
      warrenBot,
      item,
      item.estimatedMin * 1.20, // 안전 마진 초과 ($1,800)
      'player_user',
      'BRONZE',
      null
    );

    expect(decision.shouldBid).toBe(false);
  });

  it('피카소(PICASSO)는 회화가 아닌 골동품/보석 고가 호가 시 높은 확률로 조기 포기해야 한다', () => {
    const picassoBot = makeBot('PICASSO');
    const antiqueItem = MASTER_ITEMS.find((m) => m.category === 'ANTIQUE')!;

    let foldCount = 0;
    const trials = 100;
    for (let i = 0; i < trials; i++) {
      const decision = AiBotService.evaluateBid(
        picassoBot,
        antiqueItem,
        (antiqueItem.estimatedMin + antiqueItem.estimatedMax) * 0.45,
        'player_user',
        'BRONZE',
        null
      );
      if (!decision.shouldBid) {
        foldCount++;
      }
    }

    // 75% 확률로 조기 포기하므로 최소 50회 이상 포기해야 함
    expect(foldCount).toBeGreaterThanOrEqual(50);
  });
});
