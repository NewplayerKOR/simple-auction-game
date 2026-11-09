export type BgmType = 'LOBBY' | 'AUCTION' | 'CLIMAX' | 'VICTORY' | 'NONE';

/**
 * Web Audio API 기반 오디오 합성 사운드 매니저 (BGM 4종 + SFX 10종)
 * 외부 파일 의존성 없이 브라우저 내에서 즉각적이고 지연 없는 SFX 및 BGM 재생
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.35;
  private currentBgm: BgmType = 'NONE';
  private bgmTimer: number | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private visibilityAttached: boolean = false;
  private hiddenBgm: BgmType = 'NONE';

  private initContext() {
    if (typeof window === 'undefined') return;
    this.attachVisibilityHandler();
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.bgmGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();

        this.bgmGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        this.updateGains();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private updateGains() {
    if (!this.ctx || !this.masterGain || !this.bgmGain || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, t);
    this.bgmGain.gain.setValueAtTime(this.bgmVolume, t);
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, t);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.updateGains();
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.updateGains();
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    this.updateGains();
  }

  public getMuted() { return this.isMuted; }
  public getSfxVolume() { return this.sfxVolume; }
  public getBgmVolume() { return this.bgmVolume; }

  /**
   * QD-46: 탭이 숨겨지면 BGM 타이머와 AudioContext를 멈추고,
   * 다시 보이면 숨기기 전 BGM만 재개한다. SFX는 사용자 조작 없이 재생하지 않는다.
   */
  private handleVisibilityChange = () => {
    if (typeof document === 'undefined' || !this.ctx) return;

    if (document.hidden) {
      if (this.currentBgm !== 'NONE') this.hiddenBgm = this.currentBgm;
      this.stopBGM();
      void this.ctx.suspend().catch(() => undefined);
      return;
    }

    void this.ctx.resume().catch(() => undefined);
    if (this.hiddenBgm !== 'NONE') {
      const resumeType = this.hiddenBgm;
      this.hiddenBgm = 'NONE';
      this.playBGM(resumeType);
    }
  };

  private attachVisibilityHandler() {
    if (typeof document === 'undefined' || this.visibilityAttached) return;
    this.visibilityAttached = true;
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  // ----------------------------------------------------
  // 🎼 BGM 시스템
  // ----------------------------------------------------
  public playBGM(type: BgmType) {
    if (this.currentBgm === type) return;
    if (type !== 'NONE' && typeof document !== 'undefined' && document.hidden) {
      this.hiddenBgm = type;
      return;
    }
    this.stopBGM();
    this.currentBgm = type;
    if (type === 'NONE') return;

    this.initContext();
    if (!this.ctx) return;

    if (type === 'LOBBY') {
      this.startLobbyBgmLoop();
    } else if (type === 'AUCTION') {
      this.startAuctionBgmLoop();
    } else if (type === 'CLIMAX') {
      this.startClimaxBgmLoop();
    } else if (type === 'VICTORY') {
      this.startVictoryFanfare();
    }
  }

  public stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentBgm = 'NONE';
  }

  private startLobbyBgmLoop() {
    if (!this.ctx || !this.bgmGain) return;
    const playChord = () => {
      if (this.currentBgm !== 'LOBBY' || !this.ctx || !this.bgmGain) return;
      const t = this.ctx.currentTime;
      // 재즈 7th 코드 아르페지오 (Dm7 -> G7 -> Cmaj7)
      const chords = [
        [293.66, 349.23, 440.00, 523.25], // Dm7
        [392.00, 493.88, 587.33, 698.46], // G7
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00]  // Am7
      ];
      const chord = chords[Math.floor(Math.random() * chords.length)];
      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.bgmGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.1);
        gain.gain.setValueAtTime(0.08, t + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 2.5);
        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(t + idx * 0.1);
        osc.stop(t + idx * 0.1 + 2.6);
      });
    };

    playChord();
    this.bgmTimer = setInterval(playChord, 3000) as unknown as number;
  }

  private startAuctionBgmLoop() {
    if (!this.ctx || !this.bgmGain) return;
    let step = 0;
    const playTickPattern = () => {
      if (this.currentBgm !== 'AUCTION' || !this.ctx || !this.bgmGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      
      const freqs = [220, 261.63, 329.63, 392]; // A minor tension
      osc.frequency.setValueAtTime(freqs[step % freqs.length], t);
      
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(t);
      osc.stop(t + 0.35);
      step++;
    };

    playTickPattern();
    this.bgmTimer = setInterval(playTickPattern, 520) as unknown as number; // ~115 BPM
  }

  private startClimaxBgmLoop() {
    if (!this.ctx || !this.bgmGain) return;
    const playHeartbeatPulse = () => {
      if (this.currentBgm !== 'CLIMAX' || !this.ctx || !this.bgmGain) return;
      const t = this.ctx.currentTime;
      // 더블 쿵-쿵 펄스
      [0, 0.18].forEach((offset) => {
        if (!this.ctx || !this.bgmGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, t + offset);
        osc.frequency.exponentialRampToValueAtTime(30, t + offset + 0.12);
        gain.gain.setValueAtTime(0.18, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.14);
        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(t + offset);
        osc.stop(t + offset + 0.15);
      });
    };

    playHeartbeatPulse();
    this.bgmTimer = setInterval(playHeartbeatPulse, 410) as unknown as number; // ~145 BPM
  }

  private startVictoryFanfare() {
    if (!this.ctx || !this.bgmGain) return;
    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.15, s: 0 },
      { f: 659.25, d: 0.15, s: 0.16 },
      { f: 783.99, d: 0.15, s: 0.32 },
      { f: 1046.5, d: 0.6,  s: 0.48 },
      { f: 880.00, d: 0.2,  s: 1.1 },
      { f: 1046.5, d: 0.9,  s: 1.35 }
    ];
    notes.forEach(({ f, d, s }) => {
      if (!this.ctx || !this.bgmGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + s);
      gain.gain.setValueAtTime(0.2, t + s);
      gain.gain.exponentialRampToValueAtTime(0.001, t + s + d);
      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(t + s);
      osc.stop(t + s + d + 0.05);
    });
  }

  // ----------------------------------------------------
  // 🔊 SFX 10종
  // ----------------------------------------------------

  /** 1. 🔨 경매봉 타격음 (쾅!) */
  public playGavelStrike() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.18);

    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);

    // 크랙 노이즈
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.01));
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    whiteNoise.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    whiteNoise.start(t);
  }

  /** 2. 🪙 호가 칩 클릭음 */
  public playChipClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1300, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.04);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /** 3. 🔔 입찰 수락 벨소리 */
  public playBidBell() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, t); // A6
    osc.frequency.exponentialRampToValueAtTime(1750, t + 0.5);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.6);
  }

  /** 4. ⏱️ 초읽기 틱톡음 */
  public playTick(isUrgent: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isUrgent ? 1100 : 650, t);
    osc.frequency.exponentialRampToValueAtTime(isUrgent ? 450 : 220, t + 0.03);

    gain.gain.setValueAtTime(isUrgent ? 0.6 : 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  /** 5. 💓 심장 박동음 */
  public playHeartbeat() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /** 6. ✨ 찬스 카드 사용음 */
  public playCardUse() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  /** 7. 🎰 대박 Reveal 팡파르 */
  public playJackpot() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  }

  /** 8. 📉 쪽박 / 위작 Reveal 탄식음 */
  public playLoss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.6);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.7);
  }

  /** 9. 🗑️ 유찰 폐기음 (파쇄 & 타격) */
  public playDiscard() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  /** 10. 🚨 돌발 시장 속보 경보음 */
  public playNewsAlert() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const beeps = [880, 880, 1174.66]; // A5, A5, D6
    beeps.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + idx * 0.12;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }
}

export const AudioService = new SoundEngine();
