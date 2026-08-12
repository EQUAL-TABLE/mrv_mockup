import type { OcrState } from '@/pages/project/Documents';

/**
 * 프로젝트별 상세 목업 데이터.
 * 각 단계 화면이 참조하는 "이 프로젝트만의" 값(농장·생두·생산량·고지서·질량기여도·결과 수치 등)을
 * 프로젝트 id 기준으로 모아 둔다. 문헌값(생두 배출계수·분쇄/추출 원단위)·국가 통계(폐기 처리 비율)처럼
 * 제품과 무관하게 고정인 값은 각 화면의 공용 상수로 남겨 두고 여기서는 다루지 않는다.
 */

export interface FarmData {
  /** 농장명 */
  name: string;
  /** 생산국 */
  country: string;
  /** 생두명 */
  bean: string;
  /** 블렌딩 비율 (%) */
  ratio: number;
  /** 생두 단위 탄소배출량 (kg CO₂e/kg). 증빙 미선택 시 문헌값 1.165 */
  beanEmission: number;
  /** 단위 포대 중량 (kg) */
  sackWeight: number;
  /** 포대 1개 무게 (g) */
  sackUnitWeight: number;
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
  pre: number; // 제조 전 (원료·수송)
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
    stages: { pre: 2.51, manuf: 1.3, distribution: 0.18, usage: 0.72, wasteTransport: 0.05, waste: 0.34 },
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
      stages: { pre: 2.36, manuf: 1.28, distribution: 0.18, usage: 0.72, wasteTransport: 0.05, waste: 0.31 },
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
      { name: '핀카 라스니냐스', country: '콜롬비아', bean: '수프리모', ratio: 55, beanEmission: 1.21, sackWeight: 70, sackUnitWeight: 1050 },
      { name: '다크문 농장', country: '브라질', bean: '세하도 NY2', ratio: 45, beanEmission: 0.98, sackWeight: 60, sackUnitWeight: 980 },
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
      stages: { pre: 2.74, manuf: 1.4, distribution: 0.24, usage: 0.02, wasteTransport: 0.06, waste: 0.38 },
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
      { name: '스와니 디카프', country: '콜롬비아', bean: '디카페인 수프리모', ratio: 50, beanEmission: 1.28, sackWeight: 60, sackUnitWeight: 1000 },
      { name: '다크문 농장', country: '브라질', bean: '세하도 NY2', ratio: 50, beanEmission: 0.98, sackWeight: 60, sackUnitWeight: 990 },
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
      // 제품 생산까지: pre + manuf + wasteTransport + waste = 4.21
      stages: { pre: 2.52, manuf: 1.3, distribution: 0.18, usage: 0.72, wasteTransport: 0.05, waste: 0.34 },
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
    farms: [
      { name: '아웰라 농장', country: '에티오피아', bean: '예가체프 G1', ratio: 40, beanEmission: 1.165, sackWeight: 60, sackUnitWeight: 1000 },
      { name: '핀카 라스니냐스', country: '콜롬비아', bean: '수프리모', ratio: 35, beanEmission: 1.21, sackWeight: 60, sackUnitWeight: 1020 },
      { name: '안티과 마운틴', country: '과테말라', bean: 'SHB', ratio: 25, beanEmission: 1.05, sackWeight: 69, sackUnitWeight: 1000 },
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
      stages: { pre: 2.6, manuf: 1.35, distribution: 0.2, usage: 0, wasteTransport: 0, waste: 0.38 },
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
      // 계산기·제품 생산까지: pre + manuf + waste = 5.02
      stages: { pre: 3.1, manuf: 1.58, distribution: 0, usage: 0, wasteTransport: 0, waste: 0.34 },
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
      // 계산기·폐기까지: pre + manuf + usage + waste
      stages: { pre: 2.34, manuf: 1.62, distribution: 0, usage: 0.72, wasteTransport: 0, waste: 0.34 },
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
