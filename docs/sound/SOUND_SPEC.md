# 🎵 사운드 & 오디오 명세서 (Sound & AI Audio Prompt Specification)

> **문서 버전:** v1.1.0  
> **상태:** GENERATION_SPEC / 외부 오디오 파일 미검증  
> **분류:** `sound`  
> **담당:** Sound / Audio Lead  
> **운영 원칙:** 1분 이상의 BGM 및 사운드 효과는 전문 AI 오디오 생성 툴(Suno AI, Udio, ElevenLabs Sound Effects 등)을 활용하여 제작하며, **본 문서는 사용자가 복사하여 즉시 생성할 수 있는 음악 스타일 태그, 프롬프트, BPM 및 효과음 레시피**를 제공합니다.  
> **최종 수정일:** 2026-08-20  

---

> [!NOTE]
> 이 문서는 BGM·SFX 제작 프롬프트와 목표 사양을 정의한다. 현재 런타임은 Web Audio 합성음을 사용하며, 아래 MP3 파일이 생성·통합되었다는 증거는 아니다.

## 1. 🎼 배경음악(BGM) 생성 프롬프트 가이드 (Suno / Udio)

> **팁:** Suno/Udio 사용 시 `Instrumental` (가사 없는 연주곡 모드)을 반드시 활성화하세요.

---

### 1) `bgm_lobby.mp3` (로비 & 대기실)
- **무드:** 우아하고 차분한 소더비 VIP 라운지 분위기
- **길이:** 1분 ~ 1분 30초 (Loopable)
- **BPM:** ~90 BPM
- **Suno / Udio 스타일 태그 & 프롬프트:**
  > **Style Tags:** `smooth lounge jazz, elegant grand piano, acoustic upright double bass, subtle brushed drums, vintage high-society lounge, sophisticated, classy, warm acoustics, instrumental`  
  > **Prompt Description:** `An elegant, sophisticated smooth jazz piano melody for a high-end auction lounge. Warm double bass and gentle brushed drums create a relaxed yet luxurious VIP atmosphere. Clean instrumental mix.`

---

### 2) `bgm_auction_main.mp3` (경매 진행 BGM)
- **무드:** 긴장감 있으면서도 리드미컬한 입찰 배틀
- **길이:** 1분 ~ 2분 (Loopable)
- **BPM:** ~115 BPM
- **Suno / Udio 스타일 태그 & 프롬프트:**
  > **Style Tags:** `orchestral suspense, pizzicato strings, ticking clock rhythm, subtle brass swells, light cinematic percussion, game soundtrack, anticipation, tension, instrumental`  
  > **Prompt Description:** `A tense and rhythmic orchestral game track featuring crisp pizzicato strings and a steady ticking rhythm. Builds subtle anticipation for a live auction bidding battle. Classy cinematic instrumental.`

---

### 3) `bgm_auction_climax.mp3` (3초 이하 초읽기 긴박 BGM)
- **무드:** 심장이 터질 것 같은 급박한 카운트다운
- **길이:** 30초 ~ 45초 (Loopable)
- **BPM:** ~145 BPM
- **Suno / Udio 스타일 태그 & 프롬프트:**
  > **Style Tags:** `fast cinematic action suspense, accelerated heartbeat bass pulse, intense staccato violins, dramatic orchestral countdown, high adrenaline, urgent tempo, instrumental`  
  > **Prompt Description:** `An intense, adrenaline-pumping climax track with a heavy thumping heartbeat sub-bass, frantic rapid staccato violins, and rising dramatic tension for the final seconds of an auction.`

---

### 4) `bgm_result_fanfare.mp3` (최종 결과 & 갤러리 시상식)
- **무드:** 승리와 대박을 축하하는 웅장하고 화려한 팡파르
- **길이:** 30초 ~ 50초 (One-shot)
- **BPM:** ~125 BPM
- **Suno / Udio 스타일 태그 & 프롬프트:**
  > **Style Tags:** `grand celebratory orchestral fanfare, triumphant brass horns, shimmering glockenspiel, royal victory march, rich symphony, rewarding finish, uplifting, instrumental`  
  > **Prompt Description:** `A majestic and triumphant victory fanfare with powerful brass horns, soaring strings, and celebratory orchestral swells. Perfect for a grand awards ceremony and high-score showcase.`

---

## 2. 🔊 효과음(SFX) 생성 프롬프트 가이드 (ElevenLabs Sound Effects / Freesound)

| 파일명 | 효과음 명칭 | ElevenLabs SFX 추천 프롬프트 |
| :--- | :--- | :--- |
| `sfx_gavel_strike.mp3` | **경매봉 타격 (쾅!)** | `Heavy wooden auction gavel slamming hard onto a solid polished mahogany table, sharp crisp wood crack, realistic resonant echo in a large hall` |
| `sfx_bid_button_click.mp3` | 호가 버튼 클릭 | `Crisp casino clay chip clicking cleanly, high quality tactile UI sound, smooth and sharp` |
| `sfx_bid_placed.mp3` | 입찰 완료 종소리 | `Prestigious crystal service bell ding, crisp bright resonance, quiet crowd murmur in background` |
| `sfx_timer_tick.mp3` | 초읽기 틱톡 | `Loud mechanical vintage clock tick tock, crisp precise metallic click, tension building` |
| `sfx_heartbeat.mp3` | 심장 박동 | `Deep sub-bass heartbeat thump, muffled chest pulse, dramatic slow to fast pulse` |
| `sfx_card_use.mp3` | 찬스 카드 사용 | `Magical energy card activation whoosh, golden sparkle shimmer swoosh sound effect` |
| `sfx_reveal_jackpot.mp3` | 히든 가치 대박 | `Casino slot machine jackpot win chime with cascade of golden coins pouring down and enthusiastic crowd cheering` |
| `sfx_reveal_loss.mp3` | 히든 가치 쪽박 | `Comical sad trombone slide down with disappointed crowd groan and deflation sound` |
| `sfx_passed_discard.mp3` | 유찰 폐기 | `Paper shredder tearing document followed by a dull metal gavel thud, somber gong` |
| `sfx_event_alert.mp3` | 돌발 시장 속보 | `Urgent television breaking news electronic beeping broadcast intro chime, crisp alert tone` |
