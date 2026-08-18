/** 방식 안내 상단 개념 설명 콘텐츠 (LCA 관점 커피 탄소회계) */

export const LCA_INTRO = {
  title: '커피의 탄소발자국, 「이퀄테이블」로 계산합니다',
  paragraphs: [
    '전과정평가(LCA, Life Cycle Assessment)란 제품이 만들어져 쓰이고 버려지기까지 전 과정에서 나오는 환경 영향을 계산하는 방법입니다. 「이퀄테이블」은 그 중 ‘탄소발자국’에 초점을 맞춰, 커피 한 제품이 남기는 온실가스 총량(탄소발자국)을 산정합니다. 커피는 「생두 재배 → 수송 → 로스팅 → 유통 → 사용 → 폐기」의 여러 단계를 거칩니다. 각 단계에서 발생하는 탄소를 모두 더해 ‘로스팅된 커피 1kg당 몇 kg의 CO₂가 나오는지’를 구하는 것이 커피 탄소회계입니다. ',
  ],
};

/** 커피 전과정 단계 (개념용 요약) */
export interface LifecyclePhase {
  icon: 'sprout' | 'ship' | 'flame' | 'package' | 'truck' | 'coffee' | 'trash';
  name: string;
  desc: string;
}

export const LIFECYCLE: LifecyclePhase[] = [
  { icon: 'sprout', name: '재배', desc: '생두를 기르는 농장' },
  { icon: 'ship', name: '수송', desc: '산지에서 로스터리로 운반' },
  { icon: 'flame', name: '로스팅', desc: '생두를 볶아 원두로 제조' },
  { icon: 'package', name: '포장', desc: '원두를 포장재에 담아 제품화' },
  { icon: 'truck', name: '유통', desc: '완성된 커피를 납품처로 배송' },
  { icon: 'coffee', name: '사용', desc: '소비자가 커피를 내려 마심' },
  { icon: 'trash', name: '폐기', desc: '커피 찌꺼기·포장재 등의 쓰레기' },
];

/** 프로젝트 생성 시 정하는 3가지 선택 축 */
export interface AxisOption {
  name: string;
  tag?: string;
  tagTone?: 'primary' | 'warning';
  desc: string;
}
export interface Axis {
  num: string;
  title: string;
  question: string;
  options: AxisOption[];
  /** 축 전체에 대한 부가 안내 */
  note?: string;
}

export const AXES: Axis[] = [
  {
    num: '1',
    title: '산정 방식 (트랙)',
    question: 'MRV 기반 산정 방식과 추정치 기반 계산기 방식 중 어떤 걸 쓸까요?',
    options: [
      {
        name: 'MRV 기반 탄소배출량 산정',
        tag: '탄소 회계 기반 산정',
        tagTone: 'primary',
        desc: '전기 고지서·거래명세서·INVOICE와 같은 실제 증빙 문서를 업로드하면 OCR로 값을 자동으로 읽어 계산합니다. 입력값이 증빙에 근거해 신뢰도가 높고, 검토·확정 절차를 거쳐 ISO 14067·환경성적표지 인증에 활용할 수 있는 결과확인서·보고서를 발급받을 수 있습니다.',
      },
      {
        name: '탄소배출량 추정치 계산기',
        tag: '참고용',
        tagTone: 'warning',
        desc: '보유한 증빙 문서 없이도 생산량·전력 사용량 등 값을 직접 입력해 대략적인 탄소 발생량을 빠르게 확인합니다. 인증이나 공식 문서 발급에는 쓸 수 없는 참고용 결과입니다.',
      },
    ],
  },
  {
    num: '2',
    title: '방법론 (표준)',
    question: '어떤 표준으로 계산할까요?',
    note: '계산기 방식은 방법론을 선택하지 않습니다. (MRV 방식에서만 적용)',
    options: [
      {
        name: 'ISO 14067',
        tag: '국제 표준',
        tagTone: 'primary',
        desc: '제품의 탄소발자국(CFP)을 산정하는 국제 표준입니다. ‘제품 생산까지’와 ‘폐기까지’ 범위를 모두 선택할 수 있고, 국제적으로 폭넓게 통용되어 수출·글로벌 거래처 대응에 적합합니다.',
      },
      {
        name: '환경성적표지 중 탄소발자국',
        tag: '국내 인증',
        tagTone: 'primary',
        desc: '한국환경산업기술원의 환경성적표지 인증에 맞춘 국내 표준입니다. 환경성적표준의 작성지침에 따라 범위는 ‘폐기까지’만 제공하며, 이에 특화된 전용 배출계수 적용 등 인증 고유의 규칙을 따릅니다.',
      },
    ],
  },
  {
    num: '3',
    title: '산정 범위 (시스템 경계)',
    question: '어디까지 계산할까요?',
    options: [
      {
        name: '제품 생산까지 (Cradle-to-Gate)',
        desc: '생두 재배부터 로스팅·포장이 끝나 공장을 나서기 직전까지를 계산합니다. 제품 유통·소비자 사용은 포함하지 않습니다. 단, 제조공장에서 발생한 폐기물의 폐기에 따른 환경영향은 포함합니다.',
      },
      {
        name: '폐기까지 (Cradle-to-Grave)',
        desc: '생두 재배부터 제품 생산·유통·소비자 사용·폐기 처리까지 커피의 전 생애를 계산합니다. 제품이 소비자에게 전달되어 사용·폐기되는 영향까지 포함하는 가장 넓은 범위입니다.',
      },
    ],
  },
];
