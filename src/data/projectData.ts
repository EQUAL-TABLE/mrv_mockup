import type { OcrState } from '@/pages/project/Documents';

/**
 * 프로젝트별 상세 목업 데이터.
 * 각 단계 화면이 참조하는 "이 프로젝트만의" 값(농장·생두·생산량·고지서·질량기여도·결과 수치 등)을
 * 프로젝트 id 기준으로 모아 둔다. 문헌값(생두 배출계수·분쇄/추출 원단위)·국가 통계(폐기 처리 비율)처럼
 * 제품과 무관하게 고정인 값은 각 화면의 공용 상수로 남겨 두고 여기서는 다루지 않는다.
 */

/**
 * 생두 단위 탄소배출량 문헌값 (Nab & Maslin, 2020).
 * 원료 재배~수확 경계이며 20년 내 토지전용이 없다고 보고 산정한 값이라 dLUC는 0이다.
 */
export const BEAN_EMISSION_LITERATURE = 1.165;

/**
 * 농장 탄소배출 증빙문서에서 OCR로 추출한 값 (MRV 트랙).
 *
 * 생두 단위 탄소배출량은 농장이 직접 주는 게 아니라 "단위기간 총 배출량 ÷ 같은 기간 생두 생산량"으로
 * 산출된다. 검증 시 분자·분모를 추적할 수 있어야 하므로 원본 값을 그대로 보관한다.
 */
export interface FarmProof {
  /** 문서 파일명 (문서 선택 목록 표시용) */
  docLabel: string;
  /** 농장 자료 대상 기간 */
  periodFrom: string; // 'YYYY-MM'
  periodTo: string; // 'YYYY-MM'
  /** 단위기간 총 탄소배출량 (kg CO₂e) */
  totalEmission: number;
  /** 단위기간 생두 생산량 (kg) */
  greenOutput: number;
  /**
   * 단위기간 토지이용변화(dLUC) 배출량 (kg CO₂e). ISO 14067 트랙에서만 사용.
   * null = 원본 문서가 dLUC를 제공하지 않음 (0으로 대체하되 "미제공"으로 표기)
   * 0    = 문서가 dLUC 0/해당없음을 명시 (확인된 0)
   * 검토한 농장 리포트는 모두 해당 연도분 LUC만 기재하므로 20년 상각은 이미 반영된 값으로 본다.
   */
  dluc: number | null;
  /**
   * dLUC가 totalEmission 안에 이미 포함되어 있는지.
   * 대부분 포함(총계 내 하위 항목)이지만, 총계 밖에 별도 산정한 문서도 있어 상태로 둔다.
   * 포함으로 잘못 보면 과소계상, 별도로 잘못 보면 이중계산이 된다.
   */
  dlucIncluded: boolean;
}

export interface FarmData {
  /** 농장명 */
  name: string;
  /** 생산국 */
  country: string;
  /** 생두명 */
  bean: string;
  /** 블렌딩 비율 (%) */
  ratio: number;
  /** 생두 단위 탄소배출량 (kg CO₂e/kg). 증빙이 있으면 proof에서 산출한 값과 같고, 없으면 문헌값 */
  beanEmission: number;
  /** 단위 포대 중량 (kg) */
  sackWeight: number;
  /** 포대 1개 무게 (g) */
  sackUnitWeight: number;
  /** 농장 탄소배출 증빙문서 추출값. 없으면 문헌값 경로 */
  proof?: FarmProof;
}

export interface BillRow {
  month: string;
  amount: number;
  provider: string;
}

export interface GenRow {
  month: string;
  amount: number;
}

/** 단계별 배출량 (kg CO₂e / 원두 1kg). 화면은 방법론·경계에 따라 표시할 항목만 고른다. */
export interface ResultStages {
  preMaterial: number; // 제조 전 · 원부자재 (생두·포장재)
  preTransport: number; // 제조 전 · 원료 수송 (해상·내륙)
  manuf: number; // 제조 (로스팅)
  distribution: number; // 제품 유통 (폐기까지)
  usage: number; // 사용 (ISO·폐기까지)
  wasteTransport: number; // 폐기 수송 (ISO)
  waste: number; // 폐기 처리
}

export interface ProjectData {
  /** 기본정보 */
  baseYear: number;
  collectFrom: string; // 'YYYY-MM'
  collectTo: string; // 'YYYY-MM'
  functionalUnit: number; // 결과 표시 기준 수량 (kg)
  business: { name: string; bizNo: string; address: string };
  contact: { manager: string; phone: string; email: string };
  production: {
    roastVolume: number; // 단위 기간 원두 생산량 (kg RC)
    fuel: 'elec' | 'elec_gas';
    blending: 'single' | 'blend';
    scenario: 'drip' | 'espresso' | 'coldbrew';
  };
  farms: FarmData[];
  /** 최소포장재 레이블 (예: 250g 원두 봉투) */
  minPackLabel: string;
  /** 제조 단계 */
  powerBills: BillRow[];
  gasBills: BillRow[];
  gasType: 'ng' | 'lpg';
  renewable: boolean;
  genRows: GenRow[];
  /** 누적 질량 기여도 투입량 (kg/kg RC) */
  mass: { green: number; minPack: number; filter: number; box: [number, number] };
  /** 결과 */
  result: {
    stages: ResultStages;
    /** MRV 결과 화면 Scope 분해 (계산기는 미표시) */
    scope: { s1: number; s2: number; s3: number };
  };
  /** 문서 업로드 상태 override (없으면 status 기반 기본값 사용) */
  docStates?: Record<number, OcrState>;
}

const SCENARIO_LABEL: Record<ProjectData['production']['scenario'], string> = {
  drip: '드립 (필터커피)',
  espresso: '에스프레소',
  coldbrew: '콜드브루',
};
export function scenarioLabel(s: ProjectData['production']['scenario']) {
  return SCENARIO_LABEL[s];
}

/** 로그인 로스터리(작성자) 공통 정보 — 프로젝트가 달라도 같은 회사이므로 기본값으로 공유 */
const DEFAULT_BUSINESS = { name: '공드리 로스터리', bizNo: '123-45-67890', address: '서울특별시 성동구 성수이로 00' };
const DEFAULT_CONTACT = { manager: '공드리', phone: '010-0000-0000', email: 'roaster@example.com' };

/** 신규(미저장) 프로젝트 기본 데이터 — 각 화면의 fallback */
export const DEFAULT_PROJECT_DATA: ProjectData = {
  baseYear: 2026,
  collectFrom: '2026-01',
  collectTo: '2026-12',
  functionalUnit: 1,
  business: DEFAULT_BUSINESS,
  contact: DEFAULT_CONTACT,
  production: { roastVolume: 3000, fuel: 'elec_gas', blending: 'blend', scenario: 'drip' },
  farms: [
    { name: '아웰라 농장', country: '에티오피아', bean: '예가체프 G1', ratio: 60, beanEmission: 1.165, sackWeight: 60, sackUnitWeight: 1000 },
    { name: '핀카 라스니냐스', country: '콜롬비아', bean: '수프리모', ratio: 40, beanEmission: 1.165, sackWeight: 60, sackUnitWeight: 1000 },
  ],
  minPackLabel: '250g 원두 봉투',
  powerBills: [
    { month: '2026-01', amount: 1240, provider: '한국전력공사' },
    { month: '2026-02', amount: 1185, provider: '한국전력공사' },
  ],
  gasBills: [
    { month: '2026-01', amount: 320, provider: '서울도시가스' },
    { month: '2026-02', amount: 298, provider: '서울도시가스' },
  ],
  gasType: 'ng',
  renewable: false,
  genRows: [
    { month: '2026-01', amount: 210 },
    { month: '2026-02', amount: 240 },
  ],
  mass: { green: 1.3138, minPack: 0.012, filter: 0.0021, box: [0.0345, 0.0009] },
  result: {
    stages: { preMaterial: 2.18, preTransport: 0.33, manuf: 1.3, distribution: 0.18, usage: 0.72, wasteTransport: 0.05, waste: 0.34 },
    scope: { s1: 0.42, s2: 0.88, s3: 3.03 },
  },
};

/** 프로젝트별 상세 데이터 */
export const PROJECT_DATA: Record<string, ProjectData> = {
  // p1 — 에티오피아 예가체프 싱글오리진 (MRV·ISO·폐기까지·작성중)
  p1: {
    baseYear: 2026,
    collectFrom: '2026-01',
    collectTo: '2026-12',
    functionalUnit: 1,
    business: DEFAULT_BUSINESS,
    contact: DEFAULT_CONTACT,
    production: { roastVolume: 2400, fuel: 'elec_gas', blending: 'single', scenario: 'drip' },
    farms: [
      // 증빙 X → 문헌값 경로 (dLUC 0 · 20년 무변화 가정)
      { name: '아웰라 농장', country: '에티오피아', bean: '예가체프 G1', ratio: 100, beanEmission: 1.165, sackWeight: 60, sackUnitWeight: 1000 },
    ],
    minPackLabel: '250g 크라프트 봉투',
    powerBills: [
      { month: '2026-01', amount: 1240, provider: '한국전력공사' },
      { month: '2026-02', amount: 1185, provider: '한국전력공사' },
    ],
    gasBills: [
      { month: '2026-01', amount: 320, provider: '서울도시가스' },
      { month: '2026-02', amount: 298, provider: '서울도시가스' },
    ],
    gasType: 'ng',
    renewable: false,
    genRows: [],
    mass: { green: 1.3138, minPack: 0.012, filter: 0.0021, box: [0.0345, 0.0009] },
    result: {
      stages: { preMaterial: 2.05, preTransport: 0.31, manuf: 1.28, distribution: 0.18, usage: 0.72, wasteTransport: 0.05, waste: 0.31 },
      scope: { s1: 0.44, s2: 0.9, s3: 3.56 },
    },
  },

  // p2 — 콜드브루 원액용 블렌드 (MRV·ISO·폐기까지·검토중)
  p2: {
    baseYear: 2026,
    collectFrom: '2026-01',
    collectTo: '2026-12',
    functionalUnit: 1,
    business: DEFAULT_BUSINESS,
    contact: DEFAULT_CONTACT,
    production: { roastVolume: 5200, fuel: 'elec', blending: 'blend', scenario: 'coldbrew' },
    farms: [
      // 증빙 O · dLUC 제공 (50,820 ÷ 42,000 = 1.21 / 1,260 ÷ 42,000 = 0.03)
      {
        name: '핀카 라스니냐스', country: '콜롬비아', bean: '수프리모', ratio: 55, beanEmission: 1.21, sackWeight: 70, sackUnitWeight: 1050,
        proof: { docLabel: '핀카 라스니냐스_탄소배출 보고서_2026.pdf', periodFrom: '2026-01', periodTo: '2026-12', totalEmission: 50820, greenOutput: 42000, dluc: 1260, dlucIncluded: true },
      },
      // 증빙 O · dLUC 미제공 (58,800 ÷ 60,000 = 0.98)
      {
        name: '다크문 농장', country: '브라질', bean: '세하도 NY2', ratio: 45, beanEmission: 0.98, sackWeight: 60, sackUnitWeight: 980,
        proof: { docLabel: '다크문 농장_Carbon Report_2026.pdf', periodFrom: '2026-01', periodTo: '2026-12', totalEmission: 58800, greenOutput: 60000, dluc: null, dlucIncluded: true },
      },
    ],
    minPackLabel: '1kg 알루미늄 지퍼백',
    powerBills: [
      { month: '2026-01', amount: 2380, provider: '한국전력공사' },
      { month: '2026-02', amount: 2210, provider: '한국전력공사' },
    ],
    gasBills: [],
    gasType: 'ng',
    renewable: false,
    genRows: [],
    mass: { green: 1.3092, minPack: 0.018, filter: 0.0021, box: [0.0345, 0.0009] },
    result: {
      // 콜드브루는 추출 전력 원단위 0 → 사용 단계 배출이 매우 작다
      // 블렌드(콜롬비아·브라질 2개 원산지) → 원료 수송 비중이 싱글오리진보다 크다
      stages: { preMaterial: 2.36, preTransport: 0.38, manuf: 1.4, distribution: 0.24, usage: 0.02, wasteTransport: 0.06, waste: 0.38 },
      scope: { s1: 0, s2: 1.02, s3: 3.82 },
    },
  },

  // p3 — 디카페인 하우스블렌드 (MRV·ISO·제품 생산까지·완료, 결과 4.21)
  p3: {
    baseYear: 2025,
    collectFrom: '2025-01',
    collectTo: '2025-12',
    functionalUnit: 1,
    business: DEFAULT_BUSINESS,
    contact: DEFAULT_CONTACT,
    production: { roastVolume: 4100, fuel: 'elec_gas', blending: 'blend', scenario: 'drip' },
    farms: [
      // 증빙 O · dLUC 제공 (32,000 ÷ 25,000 = 1.28 / 500 ÷ 25,000 = 0.02)
      {
        name: '스와니 디카프', country: '콜롬비아', bean: '디카페인 수프리모', ratio: 50, beanEmission: 1.28, sackWeight: 60, sackUnitWeight: 1000,
        proof: { docLabel: '스와니 디카프_탄소배출 보고서_2025.pdf', periodFrom: '2025-01', periodTo: '2025-12', totalEmission: 32000, greenOutput: 25000, dluc: 500, dlucIncluded: true },
      },
      // 증빙 O · dLUC 0 명시 (확인된 0)
      {
        name: '다크문 농장', country: '브라질', bean: '세하도 NY2', ratio: 50, beanEmission: 0.98, sackWeight: 60, sackUnitWeight: 990,
        proof: { docLabel: '다크문 농장_Carbon Report_2025.pdf', periodFrom: '2025-01', periodTo: '2025-12', totalEmission: 58800, greenOutput: 60000, dluc: 0, dlucIncluded: true },
      },
    ],
    minPackLabel: '200g 삼중 증착 봉투',
    powerBills: [
      { month: '2025-01', amount: 1980, provider: '한국전력공사' },
      { month: '2025-02', amount: 1875, provider: '한국전력공사' },
    ],
    gasBills: [
      { month: '2025-01', amount: 410, provider: '서울도시가스' },
      { month: '2025-02', amount: 388, provider: '서울도시가스' },
    ],
    gasType: 'ng',
    renewable: false,
    genRows: [],
    mass: { green: 1.3138, minPack: 0.0102, filter: 0.0021, box: [0.0345, 0.0009] },
    result: {
      // 제품 생산까지: 제조전(원부자재+원료수송) + manuf + wasteTransport + waste = 4.21
      stages: { preMaterial: 2.19, preTransport: 0.33, manuf: 1.3, distribution: 0.18, usage: 0.72, wasteTransport: 0.05, waste: 0.34 },
      scope: { s1: 0.4, s2: 0.85, s3: 2.96 },
    },
  },

  // p4 — 시그니처 블렌드 (MRV·환경성적표지·폐기까지·작성중, 재생에너지 사용)
  p4: {
    baseYear: 2026,
    collectFrom: '2026-01',
    collectTo: '2026-12',
    functionalUnit: 1,
    business: DEFAULT_BUSINESS,
    contact: DEFAULT_CONTACT,
    production: { roastVolume: 6800, fuel: 'elec_gas', blending: 'blend', scenario: 'espresso' },
    // 환경성적표지 → dLUC 항목은 화면에 나타나지 않지만, 총 배출량·생산량 추출은 동일하게 적용된다
    farms: [
      { name: '아웰라 농장', country: '에티오피아', bean: '예가체프 G1', ratio: 40, beanEmission: 1.165, sackWeight: 60, sackUnitWeight: 1000 },
      {
        name: '핀카 라스니냐스', country: '콜롬비아', bean: '수프리모', ratio: 35, beanEmission: 1.21, sackWeight: 60, sackUnitWeight: 1020,
        proof: { docLabel: '핀카 라스니냐스_탄소배출 보고서_2026.pdf', periodFrom: '2026-01', periodTo: '2026-12', totalEmission: 50820, greenOutput: 42000, dluc: 1260, dlucIncluded: true },
      },
      {
        name: '안티과 마운틴', country: '과테말라', bean: 'SHB', ratio: 25, beanEmission: 1.05, sackWeight: 69, sackUnitWeight: 1000,
        proof: { docLabel: '안티과 마운틴_Carbon Report_2026.pdf', periodFrom: '2026-01', periodTo: '2026-12', totalEmission: 31500, greenOutput: 30000, dluc: null, dlucIncluded: true },
      },
    ],
    minPackLabel: '500g 알루미늄 합지 봉투',
    powerBills: [
      { month: '2026-01', amount: 3120, provider: '한국전력공사' },
      { month: '2026-02', amount: 2980, provider: '한국전력공사' },
    ],
    gasBills: [
      { month: '2026-01', amount: 540, provider: '서울도시가스' },
      { month: '2026-02', amount: 512, provider: '서울도시가스' },
    ],
    gasType: 'lpg',
    renewable: true,
    genRows: [
      { month: '2026-01', amount: 320 },
      { month: '2026-02', amount: 355 },
    ],
    mass: { green: 1.3138, minPack: 0.015, filter: 0.0021, box: [0.0412, 0.0011] },
    result: {
      // 환경성적표지·폐기까지: pre + manuf + distribution + waste (사용·폐기수송 없음)
      stages: { preMaterial: 2.24, preTransport: 0.36, manuf: 1.35, distribution: 0.2, usage: 0, wasteTransport: 0, waste: 0.38 },
      scope: { s1: 0.35, s2: 0.62, s3: 3.56 },
    },
  },

  // p5 — 케냐 AA 간편 계산 (계산기·제품 생산까지·완료, 결과 5.02)
  p5: {
    baseYear: 2026,
    collectFrom: '2026-01',
    collectTo: '2026-06',
    functionalUnit: 1,
    business: DEFAULT_BUSINESS,
    contact: DEFAULT_CONTACT,
    production: { roastVolume: 800, fuel: 'elec', blending: 'single', scenario: 'drip' },
    farms: [
      { name: '니에리 협동조합', country: '케냐', bean: '케냐 AA', ratio: 100, beanEmission: 1.31, sackWeight: 60, sackUnitWeight: 1000 },
    ],
    minPackLabel: '200g 크라프트 삼중지',
    powerBills: [],
    gasBills: [],
    gasType: 'ng',
    renewable: false,
    genRows: [],
    mass: { green: 1.3138, minPack: 0.012, filter: 0.0021, box: [0.0345, 0.0009] },
    result: {
      // 계산기·제품 생산까지: 제조전(원부자재+원료수송) + manuf + waste = 5.02
      stages: { preMaterial: 2.71, preTransport: 0.39, manuf: 1.58, distribution: 0, usage: 0, wasteTransport: 0, waste: 0.34 },
      scope: { s1: 0, s2: 0, s3: 0 },
    },
  },

  // p6 — 홀빈 세트 간편 계산 (계산기·폐기까지·작성중)
  p6: {
    baseYear: 2026,
    collectFrom: '2026-01',
    collectTo: '2026-08',
    functionalUnit: 1,
    business: DEFAULT_BUSINESS,
    contact: DEFAULT_CONTACT,
    production: { roastVolume: 1500, fuel: 'elec', blending: 'single', scenario: 'drip' },
    farms: [
      { name: '엘 파라이소', country: '콜롬비아', bean: '게이샤', ratio: 100, beanEmission: 1.09, sackWeight: 35, sackUnitWeight: 850 },
    ],
    minPackLabel: '340g 홀빈 봉투',
    powerBills: [],
    gasBills: [],
    gasType: 'ng',
    renewable: false,
    genRows: [],
    mass: { green: 1.3138, minPack: 0.014, filter: 0.0021, box: [0.0345, 0.0009] },
    result: {
      // 계산기·폐기까지: 제조전(원부자재+원료수송) + manuf + usage + waste
      stages: { preMaterial: 2.05, preTransport: 0.29, manuf: 1.62, distribution: 0, usage: 0.72, wasteTransport: 0, waste: 0.34 },
      scope: { s1: 0, s2: 0, s3: 0 },
    },
  },
};

/** id로 프로젝트 상세 데이터 조회 (없으면 신규 기본값) */
export function resolveProjectData(id: string): ProjectData {
  return PROJECT_DATA[id] ?? DEFAULT_PROJECT_DATA;
}

/** 농장들의 생두명을 " / "로 이어 붙인 라벨 (질량기여도·투입물 표기용) */
export function beanListLabel(data: ProjectData): string {
  return data.farms.map((f) => f.bean).join(' / ');
}
