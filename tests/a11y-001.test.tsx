// @vitest-environment jsdom
import fs from 'fs';
import path from 'path';
import React, { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '../src/components/common/ConfirmDialog';
import { AssetImage } from '../src/components/common/AssetImage';
import {
  AUDIO_STORAGE_KEY,
  DEFAULT_AUDIO_SETTINGS,
  loadAudioSettings,
  useAudioStore,
} from '../src/stores/useAudioStore';
import { getItemLotLabel } from '../src/services/itemDisplayService';
import { prefersReducedMotion } from '../src/services/motionService';
import { MASTER_ITEMS } from '../src/data/masterItems';

const ConfirmHarness: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>확인 창 열기</button>
      {isOpen && (
        <ConfirmDialog
          isOpen={isOpen}
          title="테스트 확인"
          description="테스트 설명"
          confirmLabel="확인"
          cancelLabel="취소"
          onConfirm={() => setIsOpen(false)}
          onCancel={() => {
            setIsOpen(false);
            onCancel();
          }}
        />
      )}
    </>
  );
};

describe('A11Y-001 접근성·실수 방지 계약', () => {
  beforeEach(() => {
    localStorage.clear();
    useAudioStore.setState({ ...DEFAULT_AUDIO_SETTINGS });
  });

  it('모달은 dialog 역할·이름·초기 포커스·Escape 닫기·포커스 복귀를 제공한다', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmHarness onCancel={onCancel} />);

    const trigger = screen.getByRole('button', { name: '확인 창 열기' });
    await user.click(trigger);

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(screen.getByRole('heading', { name: '테스트 확인' })).toHaveAttribute(
      'id',
      dialog.getAttribute('aria-labelledby')
    );
    await waitFor(() => expect(screen.getByRole('button', { name: '취소' })).toHaveFocus());

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onCancel).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('모든 모달 구현이 공통 dialog 계약을 사용한다', () => {
    const modalFiles = [
      'src/components/auction/AppraisalModal.tsx',
      'src/components/auction/MarketEventModal.tsx',
      'src/components/auction/PoliceRaidModal.tsx',
      'src/components/auction/SealedBidModal.tsx',
      'src/components/bankruptcy/BankruptcyModal.tsx',
      'src/components/codex/CodexModal.tsx',
      'src/components/common/ConfirmDialog.tsx',
      'src/components/common/SoundControlModal.tsx',
      'src/components/consignment/ConsignmentModal.tsx',
      'src/components/workshop/RestorationModal.tsx',
    ];

    for (const file of modalFiles) {
      const source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
      expect(source, `${file}: role=dialog`).toContain('role="dialog"');
      expect(source, `${file}: aria-modal`).toContain('aria-modal="true"');
      expect(source, `${file}: aria-labelledby`).toContain('aria-labelledby');
      expect(source, `${file}: focus hook`).toContain('useModalA11y');
    }
  });

  it('오디오 설정을 저장·복원하고 범위를 보정한다', () => {
    useAudioStore.getState().setSfxVolume(0.42);
    useAudioStore.getState().setBgmVolume(0.17);
    useAudioStore.getState().toggleMute();

    const stored = JSON.parse(localStorage.getItem(AUDIO_STORAGE_KEY) ?? '{}');
    expect(stored).toMatchObject({ isMuted: true, sfxVolume: 0.42, bgmVolume: 0.17 });
    expect(loadAudioSettings()).toMatchObject({ isMuted: true, sfxVolume: 0.42, bgmVolume: 0.17 });

    useAudioStore.getState().setSfxVolume(5);
    expect(useAudioStore.getState().sfxVolume).toBe(1);
    useAudioStore.getState().setBgmVolume(-1);
    expect(useAudioStore.getState().bgmVolume).toBe(0);
  });

  it('손상된 오디오 설정은 기본값으로 복구한다', () => {
    localStorage.setItem(AUDIO_STORAGE_KEY, '{not-json');
    expect(loadAudioSettings()).toEqual(DEFAULT_AUDIO_SETTINGS);
  });

  it('내부 아이템 ID 대신 3자리 LOT 번호를 표시한다', () => {
    expect(getItemLotLabel(MASTER_ITEMS[0].id)).toBe('LOT #001');
    expect(getItemLotLabel(MASTER_ITEMS[MASTER_ITEMS.length - 1].id)).toBe('LOT #030');
    expect(getItemLotLabel('unknown')).toBe('LOT');
    expect(getItemLotLabel(MASTER_ITEMS[0].id)).not.toContain('item_');
  });

  it('prefers-reduced-motion 설정을 감지한다', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true });
    Object.defineProperty(window, 'matchMedia', { value: matchMedia, configurable: true });
    expect(prefersReducedMotion()).toBe(true);

    matchMedia.mockReturnValue({ matches: false });
    expect(prefersReducedMotion()).toBe(false);
  });

  it('이미지 크기를 예약하고 실패 시 fallback으로 대체한다', async () => {
    render(<AssetImage src="/missing.webp" alt="테스트 이미지" width={320} height={240} />);
    const image = screen.getByAltText('테스트 이미지');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
    expect(image).toHaveAttribute('width', '320');
    expect(image).toHaveAttribute('height', '240');

    fireEvent.error(image);
    await waitFor(() => expect(image.getAttribute('src')).toMatch(/^data:image\/svg\+xml/));
  });

  it('백그라운드 오디오와 폰트·모션 정책이 소스에 반영되어 있다', () => {
    const audioSource = fs.readFileSync(
      path.resolve(__dirname, '../src/services/audioService.ts'),
      'utf8'
    );
    expect(audioSource).toContain('visibilitychange');
    expect(audioSource).toContain('suspend');
    expect(audioSource).toContain('hiddenBgm');

    const tailwind = fs.readFileSync(path.resolve(__dirname, '../tailwind.config.js'), 'utf8');
    expect(tailwind).toContain("950: '#3B2A0B'");
    expect(tailwind).not.toContain('Noto Sans KR');
    expect(tailwind).toContain("'system-ui'");

    const css = fs.readFileSync(path.resolve(__dirname, '../src/index.css'), 'utf8');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).not.toContain('Noto Sans KR');
  });
});
