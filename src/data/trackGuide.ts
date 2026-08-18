import type { Boundary, Methodology, Track } from '@/types/project';

/** 트랙 안내 페이지 콘텐츠 (설계 문서 기준, 쉬운 말로 요약) */

export interface GuideStage {
  /** 쉬운 단계 이름 */
  title: string;
  /** 무엇을 하는 단계인지 */
  desc: string;
  /** 입력해야 하는 데이터 (쉬운 말) */
  inputs: string[];
  /** 관련 문서 (MRV 트랙) */
  docs?: string[];
  /** 자동 계산 단계 (사용자 입력 없음) */
  auto?: boolean;
}

export interface GuidePhase {
  /** 전과정(LCA) 묶음 이름 */
  phase: string;
  stages: GuideStage[];
}

export interface DocItem {
  name: string;
  note: string;
  required: boolean;
  /** 이 방법론에서만 필요 (없으면 모든 방법론에 해당) */
  methodology?: Methodology;
  /** 이 산정 범위에서만 필요 (없으면 모든 범위에 해당). 'grave' = 폐기까지일 때만 */
  boundary?: Boundary;
}

export interface TrackGuideContent {
  key: Track;
  name: string;
  tagline: string;
  canCertify: boolean;
  summary: string;
  whenToUse: string[];
  phases: GuidePhase[];
}

/**
 * MRV 트랙에서 준비하면 좋은 증빙 문서 (설계 문서 §2.1 기준).
 * methodology·boundary 조건이 붙은 문서는 해당 선택일 때만 노출된다. (getDocuments 참고)
 */
export const MRV_DOCUMENTS: DocItem[] = [
  { name: '생두 INVOICE', note: '생두 구매 내역서 (수량·원산지)', required: true },
  { name: '전력 고지서', note: '로스팅에 사용한 전기 사용량', required: true },
  { name: 'B/L 또는 항공화물운송장', note: '생두 국제 운송 서류', required: true },
  { name: '가스 고지서', note: '가스 로스터기를 쓰는 경우', required: true },
  { name: '납품 거래명세서·운송장', note: '납품처 주소·배송 내역이 증빙 가능한 자료', required: true, boundary: 'grave' },
  { name: '농장 탄소배출 증빙문서', note: '농장이 제공한 탄소배출 자료 (있는 경우)', required: false },
  { name: '수출국 내륙수송 거래명세서', note: '산지에서 항구까지 운송 내역', required: false },
  { name: '수입국 내륙수송 거래명세서', note: '국내 항구에서 로스터리까지 운송 내역', required: false },
  { name: '최소포장재 구매 거래명세서', note: '봉투·밸브 등 포장재 구매 내역', required: false },
  { name: '출하포장재 구매 거래명세서', note: '박스·테이프 등 출하용 포장재', required: false, methodology: 'epd' },
  { name: '부자재(여과지) 구매 거래명세서', note: '드립백 여과지 (드립 시나리오일 때)', required: false, methodology: 'iso', boundary: 'grave' },
  { name: '생두 포대 무게 증빙 사진', note: '포대 1개 무게 (저울/표기 사진)', required: false },
  { name: '재생에너지 설치 확인서', note: '자가 태양광 등 설치 서류', required: false },
  { name: '재생에너지 발전량 모니터링 기록', note: '자가발전 실제 사용량 기록', required: false },
  { name: '재활용폐기물처리 증빙서류', note: '황마 포대·포장재 등 제조단계 폐기물 재활용 처리 실적', required: false },
];

/** 선택한 방법론·산정 범위에 해당하는 준비 문서만 추린다. */
export function getDocuments(methodology: Methodology, boundary: Boundary): DocItem[] {
  return MRV_DOCUMENTS.filter((d) => {
    if (d.methodology && d.methodology !== methodology) return false;
    if (d.boundary === 'grave' && boundary !== 'grave') return false;
    return true;
  });
}

export const TRACK_GUIDES: Record<Track, TrackGuideContent> = {
  mrv: {
    key: 'mrv',
    name: 'MRV 기반 탄소배출량 산정',
    tagline: '증빙 문서 기반 · 탄소 회계 기반 산정',
    canCertify: true,
    summary:
      '전기 고지서·거래명세서 등 실제 증빙 문서를 올리면 시스템이 자동으로 읽어 계산합니다. 검토·확정을 거쳐 탄소 회계 산정 결과를 담은 결과확인서와 보고서를 받아볼 수 있는 정확한 방식이며, 이 문서는 제3자 검증을 거쳐 인증에 활용할 수 있습니다.',
    whenToUse: [
      '거래처·인증기관 제출에 활용할 수 있는 탄소 회계 산정 결과가 필요할 때',
      '전기 고지서·생두 인보이스 등 실제 증빙을 보유하고 있을 때',
      'ISO 14067 또는 환경성적표지 인증을 목표로 할 때',
    ],
    phases: [
      {
        phase: '준비',
        stages: [
          {
            title: '프로젝트 기본정보',
            desc: '산정 방식(방법론·범위)을 정하고 제품·기간 정보를 등록합니다.',
            inputs: ['프로젝트명', '기준연도·데이터 수집기간', '원두 생산량', '로스터기 연료(전기/전기+가스)', '블렌딩 비율', '사용 방식(드립/에스프레소/콜드브루)'],
          },
          {
            title: '증빙 문서 업로드',
            desc: '준비한 고지서·명세서를 올리면 자동으로 값이 읽혀 각 단계에 채워집니다.',
            inputs: ['증빙 문서 파일 업로드'],
            docs: ['생두 INVOICE(필수)', '전력 고지서(필수)', '그 외 해당 문서'],
          },
        ],
      },
      {
        phase: '제조 전 (원료·투입물)',
        stages: [
          {
            title: '원부자재 (생두·포장재)',
            desc: '생두 농장 정보와 포장재를 등록합니다. 문서에서 읽은 값이 미리 채워집니다.',
            inputs: ['농장·생두 정보', '생두 포대 무게', '포장재 종류·무게'],
            docs: ['생두 INVOICE', '농장 증빙문서', '포대 무게 사진', '포장재 명세서'],
          },
          {
            title: '원료 수송',
            desc: '생두가 농장에서 로스터리까지 오는 경로별 이동 거리를 계산합니다.',
            inputs: ['수출국 내륙 → 국제 → 수입국 내륙 구간 정보(거리는 자동)'],
            docs: ['B/L·항공운송장', '내륙수송 거래명세서'],
          },
          {
            title: '누적 질량 기여도',
            desc: '투입한 재료들의 질량 비중을 시스템이 자동으로 계산합니다.',
            inputs: [],
            auto: true,
          },
        ],
      },
      {
        phase: '제조 (로스팅)',
        stages: [
          {
            title: '제조 단계',
            desc: '로스팅에 쓴 전기·가스 사용량을 고지서 기준으로 반영합니다. 채프 발생량은 자동 계산됩니다.',
            inputs: ['전기 사용량(고지서)', '가스 사용량(해당 시)', '재생에너지 사용량(해당 시)'],
            docs: ['전력 고지서', '가스 고지서', '재생에너지 서류'],
          },
        ],
      },
      {
        phase: '제조 후 (유통·사용·폐기)',
        stages: [
          {
            title: '제품 유통',
            desc: '완성된 커피가 납품처까지 이동하는 거리를 계산합니다. (폐기까지 산정 시)',
            inputs: ['납품처 정보(거리는 자동)'],
            docs: ['납품 거래명세서'],
          },
          {
            title: '사용 단계',
            desc: '선택한 사용 방식(드립/에스프레소/콜드브루)에 따라 소비자 사용 배출을 자동 계산합니다.',
            inputs: [],
            auto: true,
          },
          {
            title: '폐기 수송',
            desc: '폐기물이 처리시설까지 이동하는 거리를 자동으로 계산합니다.',
            inputs: [],
            auto: true,
          },
          {
            title: '폐기 처리',
            desc: '커피박·포장재 등 폐기물의 처리 방식을 반영합니다. 재활용 증빙이 있으면 우선 적용됩니다.',
            inputs: ['폐기물 처리 방식', '재활용 실적(해당 시)'],
            docs: ['재활용폐기물처리 증빙'],
          },
        ],
      },
      {
        phase: '마무리',
        stages: [
          {
            title: '검토',
            desc: '입력 내용을 항목별로 한 번에 점검하고, 이상이 없으면 결과를 확정합니다.',
            inputs: ['검토 항목 확인 후 확정'],
          },
          {
            title: '결과',
            desc: '단계별 탄소배출량과 최종 탄소발자국을 확인하고, 탄소 회계 산정 결과를 담은 결과확인서·보고서를 받아봅니다.',
            inputs: ['결과 확인 · 보고서 발급'],
          },
        ],
      },
    ],
  },

  calculator: {
    key: 'calculator',
    name: '탄소배출량 추정치 계산기',
    tagline: '직접 입력 · 참고용',
    canCertify: false,
    summary:
      '증빙 문서 없이 값을 직접 입력해 대략적인 탄소량을 빠르게 확인합니다. 간편하지만 인증·문서 발급은 되지 않는 참고용입니다. 문서 업로드·검토·확정 단계가 없습니다.',
    whenToUse: [
      '아직 증빙 문서가 없어 대략적인 값만 빠르게 보고 싶을 때',
      '제품 개선·내부 검토 목적의 참고 수치가 필요할 때',
      '인증이나 공식 문서 발급이 필요하지 않을 때',
    ],
    phases: [
      {
        phase: '준비',
        stages: [
          {
            title: '프로젝트 기본정보',
            desc: '제품·생산량 등 기본 정보를 입력합니다. (문서 업로드·작성자 정보 단계 없음)',
            inputs: ['프로젝트명', '기준연도', '원두 생산량', '로스터기 연료', '사용 방식(폐기까지 산정 시)'],
          },
        ],
      },
      {
        phase: '제조 전 (원료·투입물)',
        stages: [
          {
            title: '원부자재 (생두·포장재)',
            desc: '단일 생두와 포장재 정보를 직접 입력합니다. (블렌딩 없음)',
            inputs: ['생두 원산지·투입량', '포장재 종류·무게'],
          },
          {
            title: '원료 수송',
            desc: '생두 이동 거리를 직접 입력합니다.',
            inputs: ['수송 거리(직접 입력)'],
          },
        ],
      },
      {
        phase: '제조 (로스팅)',
        stages: [
          {
            title: '제조 단계',
            desc: '로스팅에 사용한 전력을 소비전력·가동시간으로 추정 입력합니다.',
            inputs: ['소비전력', '가동시간', '가스 사용량(해당 시)'],
          },
        ],
      },
      {
        phase: '제조 후 (사용·폐기)',
        stages: [
          {
            title: '사용 단계',
            desc: '선택한 사용 방식에 따라 자동 계산됩니다. (폐기까지 산정 시)',
            inputs: [],
            auto: true,
          },
          {
            title: '폐기 처리',
            desc: '폐기물은 국가 통계 기준으로 자동 처리됩니다. (별도 입력 없음)',
            inputs: [],
            auto: true,
          },
        ],
      },
      {
        phase: '마무리',
        stages: [
          {
            title: '결과',
            desc: '추정 탄소발자국을 확인합니다. 참고용이며 인증·보고서 발급은 되지 않습니다.',
            inputs: ['추정 결과 확인'],
          },
        ],
      },
    ],
  },
};
