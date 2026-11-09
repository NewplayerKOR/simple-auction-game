import { assetUrl } from '../services/assetService';
import { Player } from '../types';

export const MASTER_BOTS: Omit<Player, 'cash' | 'chanceCards' | 'hasTakenLoan' | 'loanRepaymentAmount' | 'inventory'>[] = [
  {
    id: 'bot_warren',
    name: '워렌 봇핏',
    isHuman: false,
    persona: 'WARREN',
    personaTitle: '현명한 가치투자의 대가',
    avatar: assetUrl('/assets/images/avatars/avatar_warren.webp'),
    favoriteCategory: 'ANTIQUE',
    dialogues: {
      roundStart: [
        '남들이 탐욕을 부릴 때 두려워하고, 두려워할 때 탐욕을 부려라.',
        '내재 가치 대비 안전 마진이 충분한지 계산해 보겠네.',
        '경매는 숫자의 미학이지. 과열된 분위기에 휩쓸리지 않겠네.'
      ],
      bidPlaced: [
        '이 정도 가격이면 내재 가치 대비 합리적인 선이지.',
        '차분하게 한 단계 더 올려보도록 하지.',
        '장기 보유 관점에서 매력적인 밸류에이션이야.'
      ],
      itemWon: [
        '훌륭한 가격에 인수했군. 복리의 마법을 기대하지.',
        '안전 마진을 지켜낸 성공적인 투자였네.'
      ],
      itemLost: [
        '과열된 가격에는 한 발 물러서는 것이 투자자의 원칙이지.',
        '무리한 입찰은 파멸을 부를 뿐. 다음 기회를 보겠네.'
      ],
      itemPassed: [
        '가치 없는 물건에 지갑을 열지 않는 것도 현명함이지.',
        '시장의 냉정한 판단이군.'
      ],
      forgeryReaction: [
        '허허, 철저한 감정 없는 투자는 도박과 같음을 다시금 깨닫는군.'
      ]
    }
  },
  {
    id: 'bot_doge',
    name: '도지 킴',
    isHuman: false,
    persona: 'DOGE',
    personaTitle: '한판승부 하이롤러',
    avatar: assetUrl('/assets/images/avatars/avatar_doge.webp'),
    favoriteCategory: 'JEWELRY',
    dialogues: {
      roundStart: [
        '가즈아! 오늘은 이 경매장의 모든 보물을 쓸어 담는다!',
        '돈은 벌려고 쓰는 거야! 인생은 한 방!',
        '어설프게 간 보지 마라, 화끈하게 붙어보자고!'
      ],
      bidPlaced: [
        '누가 감히 내 가격을 넘봐? 바로 비벼주지!',
        '시원하게 한 방 더 올린다! 따라올 테면 따라와 봐!',
        '풀매수 간다! 가격 따윈 중요하지 않아!'
      ],
      itemWon: [
        '하하하! 봤냐? 내 자금력 앞에서는 아무도 못 버티지!',
        '나이스! 이건 내 컬렉션의 찬란한 트로피다!'
      ],
      itemLost: [
        '크윽... 저 녀석 미친 거 아니야? 저 가격에 산다고?!',
        '흥, 이번엔 양보해 준 거다! 다음엔 국물도 없어!'
      ],
      itemPassed: [
        '쳇, 다들 쫄보들만 모였나? 왜 아무도 안 질러?!',
        '재미없게 유찰이라니... 다음 판 가자!'
      ],
      forgeryReaction: [
        '뭐?! 가짜라고?! 내 돈 돌려내!! 사기꾼들아!!'
      ]
    }
  },
  {
    id: 'bot_picasso',
    name: '피카소 리',
    isHuman: false,
    persona: 'PICASSO',
    personaTitle: '예술 집착 컬렉터',
    avatar: assetUrl('/assets/images/avatars/avatar_picasso.webp'),
    favoriteCategory: 'PAINTING',
    dialogues: {
      roundStart: [
        '오... 저 붓터치, 저 색채의 조화... 영혼이 전율하는군!',
        '예술의 진정한 가치는 속세의 돈으로 환산할 수 없습니다.',
        '이 명작은 반드시 제 개인 미술관에 걸려야 합니다.'
      ],
      bidPlaced: [
        '이 위대한 걸작을 위해서라면 제 모든 것을 바치겠습니다!',
        '영혼을 울리는 예술에 돈을 아끼지 않습니다!',
        '미적 가치를 모르는 분들은 비켜서십시오!'
      ],
      itemWon: [
        '아아! 마침내 이 아름다움이 제 품으로 들어왔군요! 브라보!',
        '이것이야말로 영원불멸의 예술입니다!'
      ],
      itemLost: [
        '비극입니다... 저토록 숭고한 작품을 속물에게 빼앗기다니...',
        '마음이 찢어지는군요... 저 명작이 눈에 밟힙니다...'
      ],
      itemPassed: [
        '예술을 몰라보는 야만의 시대에 살고 있군요... 안타깝습니다.',
        '명작이 빛을 보지 못하고 폐기되다니 통탄할 일입니다.'
      ],
      forgeryReaction: [
        '위작이라니... 예술에 대한 모독이자 영혼의 배신입니다!'
      ]
    }
  }
];
