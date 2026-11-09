import { MASTER_ITEMS } from '../data/masterItems';

/**
 * 내부 마스터 ID를 UI에 직접 노출하지 않고 3자리 LOT 번호로 표시한다.
 * 예: item_br_04 -> LOT #004
 */
export const getItemLotLabel = (itemId: string): string => {
  const index = MASTER_ITEMS.findIndex((item) => item.id === itemId);
  return index >= 0 ? `LOT #${String(index + 1).padStart(3, '0')}` : 'LOT';
};
