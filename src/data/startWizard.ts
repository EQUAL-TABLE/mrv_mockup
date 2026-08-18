import type { Boundary, Methodology, Track } from '@/types/project';

/**
 * 신규 프로젝트 시작 위저드 콘텐츠.
 * 3단계(산정 방식 → 방법론 → 산정 범위) 각각의 좌/우 선택지 설명을 정의한다.
 * 축별로 선택지·설명·잠금 규칙이 상이한 부분(계산기=방법론 없음, EPD=폐기까지 고정)을 반영한다.
 */

export type WizardIcon = 'mrv' | 'calculator' | 'iso' | 'epd' | 'gate' | 'grave';

export interface WizardOption<T extends string> {
  value: T;
  icon: WizardIcon;
  /** 카드 제목 */
  title: string;
  /** 제목 아래 한 줄 부제 */
  subtitle: string;
  tag?: string;
  tagTone?: 'primary' | 'warning';
  /** 트랙/방법론/경계 설명 (본문) */
  desc: string;
  /** 핵심 특징 3가지 */
  bullets: string[];
}

/** 1단계 — 산정 방식(트랙) */
export const TRACK_OPTIONS: WizardOption<Track>[] = [
  {
    value: 'mrv',
    icon: 'mrv',
    title: 'MRV 트랙',
    subtitle: '증빙 문서 기반 · 탄소 회계 기반 산정',
    tag: '탄소 회계 기반 산정',
    tagTone: 'primary',
    desc: '전기 고지서·거래명세서·인보이스 같은 실제 증빙을 올리면 시스템이 OCR로 값을 자동으로 읽어 계산합니다. 입력값이 증빙에 근거해 신뢰도가 높고, 검토·확정 절차를 거쳐 탄소 회계 산정 결과를 담은 결과확인서·보고서를 받아볼 수 있습니다.',
    bullets: [
      '고지서·거래명세서를 OCR로 자동 판독해 값을 채움',
      '검토·확정 후 결과확인서·보고서 제공',
      '제3자 검증을 거쳐 ISO 14067·환경성적표지 인증에 활용 가능',
    ],
  },
  {
    value: 'calculator',
    icon: 'calculator',
    title: '계산기 트랙',
    subtitle: '값 직접 입력 · 참고용',
    tag: '참고용',
    tagTone: 'warning',
    desc: '보유한 증빙이 없어도 생산량·전력 사용량 등 값을 직접 입력해 대략적인 탄소량을 빠르게 확인합니다. 문서 업로드·검토·확정 단계가 없어 간단하지만, 인증이나 공식 문서 발급에는 쓸 수 없는 참고용 결과입니다.',
    bullets: [
      '증빙 없이 값을 직접 입력해 빠르게 추정',
      '문서 업로드·검토·확정 단계 없음 (가장 간단)',
      '인증·문서 발급 불가한 참고 수치',
    ],
  },
];

/** 2단계 — 방법론(표준). 계산기 트랙에서는 이 단계를 건너뛴다(방법론 선택 없음). */
export const METHODOLOGY_OPTIONS: WizardOption<Methodology>[] = [
  {
    value: 'iso',
    icon: 'iso',
    title: 'ISO 14067',
    subtitle: '제품 탄소발자국 국제 표준',
    tag: '국제 표준',
    tagTone: 'primary',
    desc: '제품의 탄소발자국(CFP)을 산정하는 국제 표준입니다. 산정 범위를 ‘제품 생산까지’와 ‘폐기까지’ 모두 선택할 수 있고, 국제적으로 폭넓게 통용되어 수출·글로벌 거래처 대응에 적합합니다.',
    bullets: [
      '‘제품 생산까지·폐기까지’ 범위 모두 선택 가능',
      '국제적으로 폭넓게 통용되는 표준',
      '수출·글로벌 거래처 대응에 적합',
    ],
  },
  {
    value: 'epd',
    icon: 'epd',
    title: '환경성적표지 중 탄소발자국',
    subtitle: '한국환경산업기술원 국내 인증',
    tag: '국내 인증',
    tagTone: 'primary',
    desc: '한국환경산업기술원의 환경성적표지 인증에 맞춘 국내 표준입니다. 산정 범위는 ‘폐기까지’로 고정되며, 소비자 사용 단계 제외·전용 배출계수 적용 등 인증 고유의 규칙을 따릅니다. 국내 환경성적표지 인증 취득이 목표일 때 적합합니다.',
    bullets: [
      '산정 범위가 ‘폐기까지’로 자동 고정',
      '소비자 사용 단계 제외 등 전용 규칙 적용',
      '국내 환경성적표지 인증 취득에 적합',
    ],
  },
];

/** 3단계 — 산정 범위(시스템 경계) */
export const BOUNDARY_OPTIONS: WizardOption<Boundary>[] = [
  {
    value: 'gate',
    icon: 'gate',
    title: '제품 생산까지',
    subtitle: 'Cradle-to-Gate (C2Gate)',
    desc: '생두 재배부터 로스팅·포장이 끝나 제품이 공장을 나서기 직전까지를 계산합니다. 제품 유통·소비자 사용은 포함하지 않습니다. 단, 제조공장에서 발생한 폐기물의 폐기에 따른 환경영향은 포함합니다.',
    bullets: [
      '재배 → 로스팅 → 포장 완료(출고 직전)까지',
      '제품 유통·소비자 사용 단계는 제외',
      '제조공장 폐기물 처리 영향은 포함',
    ],
  },
  {
    value: 'grave',
    icon: 'grave',
    title: '폐기까지',
    subtitle: 'Cradle-to-Grave (C2Grave)',
    desc: '생두 재배부터 제품 생산·유통·소비자 사용·폐기 처리까지 커피의 전 생애를 계산합니다. 제품이 소비자에게 전달되어 사용·폐기되는 영향까지 포함하는 가장 넓은 범위입니다.',
    bullets: [
      '재배 → 생산 → 유통 → 사용 → 폐기 전 생애',
      '소비자 사용·폐기 처리 영향까지 포함',
      '가장 넓은 시스템 경계 (환경성적표지 기본)',
    ],
  },
];
