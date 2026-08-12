// 관리자(Admin) 모듈 목업 데이터 및 타입 — ADM_관리자_기능도출_20260812.md 기준
// 관리자 사이트(별도 도메인·별도 배포) 전용. 전 기능 Super Admin 권한.

// ── 사용자 (ADM-USER) ─────────────────────────────────────
export type UserRole = 'manager' | 'member';
export type UserStatus = 'active' | 'suspended' | 'withdrawn';

export const USER_ROLE_LABEL: Record<UserRole, string> = { manager: 'Manager', member: 'Member' };
export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: '활성',
  suspended: '정지',
  withdrawn: '탈퇴',
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  tenantName: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  lastLoginAt?: string;
}

export interface LoginHistory {
  at: string;
  ip: string;
  device: string;
  result: 'success' | 'fail';
}

export const ADMIN_USERS: AdminUser[] = [
  { id: 'u1', name: '김로스터', email: 'roaster@gongdry.com', tenantId: 't1', tenantName: '공드리 로스터리', role: 'manager', status: 'active', joinedAt: '2026-03-11', lastLoginAt: '2026-08-12 09:14' },
  { id: 'u2', name: '이바리스타', email: 'barista@gongdry.com', tenantId: 't1', tenantName: '공드리 로스터리', role: 'member', status: 'active', joinedAt: '2026-04-02', lastLoginAt: '2026-08-11 18:22' },
  { id: 'u3', name: '박대표', email: 'ceo@beanslab.kr', tenantId: 't2', tenantName: '빈즈랩 커피', role: 'manager', status: 'active', joinedAt: '2026-01-20', lastLoginAt: '2026-08-12 08:01' },
  { id: 'u4', name: '최연구', email: 'lab@beanslab.kr', tenantId: 't2', tenantName: '빈즈랩 커피', role: 'member', status: 'suspended', joinedAt: '2026-02-15', lastLoginAt: '2026-07-30 11:40' },
  { id: 'u5', name: '정매니저', email: 'manager@aromaroast.co.kr', tenantId: 't3', tenantName: '아로마로스트', role: 'manager', status: 'active', joinedAt: '2026-05-06', lastLoginAt: '2026-08-10 14:55' },
  { id: 'u6', name: '한퇴사', email: 'former@aromaroast.co.kr', tenantId: 't3', tenantName: '아로마로스트', role: 'member', status: 'withdrawn', joinedAt: '2026-05-06', lastLoginAt: '2026-06-18 10:02' },
  { id: 'u7', name: '오신입', email: 'newbie@greenbean.io', tenantId: 't4', tenantName: '그린빈 컴퍼니', role: 'member', status: 'active', joinedAt: '2026-08-01', lastLoginAt: '2026-08-09 16:31' },
  { id: 'u8', name: '서대표', email: 'boss@greenbean.io', tenantId: 't4', tenantName: '그린빈 컴퍼니', role: 'manager', status: 'active', joinedAt: '2026-06-22', lastLoginAt: '2026-08-12 07:48' },
];

export const USER_LOGIN_HISTORY: LoginHistory[] = [
  { at: '2026-08-12 09:14', ip: '211.234.11.9', device: 'Chrome · Windows', result: 'success' },
  { at: '2026-08-11 18:22', ip: '211.234.11.9', device: 'Safari · iPhone', result: 'success' },
  { at: '2026-08-11 09:03', ip: '58.140.77.2', device: 'Chrome · Windows', result: 'fail' },
  { at: '2026-08-10 08:40', ip: '211.234.11.9', device: 'Chrome · Windows', result: 'success' },
];

// ── 테넌트 (ADM-TENANT) ───────────────────────────────────
export type TenantStatus = 'active' | 'suspended';
export const TENANT_STATUS_LABEL: Record<TenantStatus, string> = { active: '활성', suspended: '정지' };

export interface Tenant {
  id: string;
  name: string;
  bizNo: string; // 사업자등록번호
  owner: string; // 대표담당자
  address: string;
  userCount: number;
  projectCount: number;
  joinedAt: string;
  status: TenantStatus;
}

export const TENANTS: Tenant[] = [
  { id: 't1', name: '공드리 로스터리', bizNo: '214-88-01234', owner: '김로스터', address: '서울 마포구 성미산로 123', userCount: 2, projectCount: 6, joinedAt: '2026-03-11', status: 'active' },
  { id: 't2', name: '빈즈랩 커피', bizNo: '128-81-55667', owner: '박대표', address: '경기 성남시 분당구 판교로 45', userCount: 2, projectCount: 3, joinedAt: '2026-01-20', status: 'active' },
  { id: 't3', name: '아로마로스트', bizNo: '312-05-99881', owner: '정매니저', address: '부산 해운대구 센텀로 9', userCount: 2, projectCount: 1, joinedAt: '2026-05-06', status: 'suspended' },
  { id: 't4', name: '그린빈 컴퍼니', bizNo: '105-87-33220', owner: '서대표', address: '인천 연수구 송도과학로 77', userCount: 2, projectCount: 4, joinedAt: '2026-06-22', status: 'active' },
];

export interface TenantDoc {
  name: string;
  type: string;
  uploadedAt: string;
  ocrStatus: 'done' | 'processing' | 'fail';
}

export const TENANT_DOCS: TenantDoc[] = [
  { name: '사업자등록증.pdf', type: '사업자등록증', uploadedAt: '2026-03-11', ocrStatus: 'done' },
  { name: '전력고지서_2026-06.pdf', type: '전력 고지서', uploadedAt: '2026-07-02', ocrStatus: 'done' },
  { name: '가스고지서_2026-06.jpg', type: '가스 고지서', uploadedAt: '2026-07-02', ocrStatus: 'processing' },
];

// 프로젝트 감사 이력 (ADM-LOG-002) — 테넌트 상세 하위 탭
export interface ProjectAuditItem {
  at: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
}

export const PROJECT_AUDIT: ProjectAuditItem[] = [
  { at: '2026-08-06 14:20', actor: '김로스터', action: '보고서 발행', target: '콜드브루 원액용 블렌드 2026', detail: '스냅샷 버전 v2.1 고정' },
  { at: '2026-08-05 11:02', actor: '이바리스타', action: 'OCR 수정', target: '콜드브루 원액용 블렌드 2026', detail: '전력 사용량 1,240 → 1,204 kWh' },
  { at: '2026-08-04 09:41', actor: '김로스터', action: '입력값 변경', target: '에티오피아 예가체프 2026', detail: '수송 거리 320 → 340 km' },
  { at: '2026-07-28 16:33', actor: '김로스터', action: '프로젝트 확정', target: '디카페인 하우스블렌드 2026', detail: '결과 4.21 kg CO2e/kg' },
];

// ── 버전/매칭 메타데이터 ──────────────────────────────────
// 프로젝트 연도·사용자 입력값 기반 자동 매칭 로직이 참조하는 메타.
// 실제 매칭 설계가 확정되지 않았고 EF에 등록·공고·적용연도가 명시되지 않은 경우가 많으므로
// 모든 항목을 선택(optional)으로 두고, 관리자가 파악 가능한 만큼만 입력한다.
export interface VersionMeta {
  effectiveYear?: string; // 적용(기준) 연도 — 매칭 1순위 기준. 미상일 수 있음
  announcedAt?: string; // 공고일(발표일)
  registeredAt?: string; // 시스템 등록일(자동)
  dataVersion?: string; // 데이터 버전 (관리자 자유 텍스트)
  matchNote?: string; // 매칭 판단 근거 (시스템 경계·공정 흐름 등 종합 검토 메모)
}

// ── 배출계수 EF (ADM-EF) ──────────────────────────────────
export type EfStage = 'material' | 'transport' | 'manufacturing' | 'usage' | 'waste';
export type EfStandard = 'iso' | 'epd';
export type EfState = 'active' | 'pending' | 'archived';

export const EF_STAGE_LABEL: Record<EfStage, string> = {
  material: '원부자재',
  transport: '수송',
  manufacturing: '제조단계',
  usage: '사용단계',
  waste: '폐기단계',
};
export const EF_STANDARD_LABEL: Record<EfStandard, string> = { iso: 'ISO 14067', epd: '환경성적표지' };
export const EF_STATE_LABEL: Record<EfState, string> = { active: '현재버전', pending: '적용대기중', archived: '이력' };
// GWP 표시 원칙: ISO=AR5, 환경성적표지=SAR 준용
export const EF_GWP_LABEL: Record<EfStandard, string> = { iso: 'AR5', epd: 'SAR 준용' };

export interface EmissionFactor {
  id: string;
  name: string;
  stage: EfStage;
  standard: EfStandard;
  value: number;
  unit: string;
  source: string;
  version: string;
  updatedAt: string;
  updatedBy: string;
  dqi: number; // DQI 종합점수 (1~5, 낮을수록 우수)
  state: EfState;
  /** 에너지원 조합 자동계산값 등 직접입력 불가 항목 */
  computed?: boolean;
  effectiveAt?: string; // 적용시작일 (pending 항목)
  meta?: VersionMeta; // 버전/매칭 메타데이터
}

export const EMISSION_FACTORS: EmissionFactor[] = [
  { id: 'ef1', name: '생두 (아라비카, 문헌값)', stage: 'material', standard: 'iso', value: 1.92, unit: 'kg CO2e/kg', source: 'Ecoinvent 3.9 (2024)', version: 'v3', updatedAt: '2026-07-01', updatedBy: 'admin', dqi: 2.1, state: 'active', meta: { effectiveYear: '2024', dataVersion: 'Ecoinvent 3.9', registeredAt: '2026-07-01', matchNote: '원료 재배·수입 경계. 아라비카 생두 대상' } },
  { id: 'ef2', name: '크라프트페이퍼 포장재', stage: 'material', standard: 'epd', value: 0.94, unit: 'kg CO2e/kg', source: '환경성적표지 DB (2023)', version: 'v2', updatedAt: '2026-05-14', updatedBy: 'admin', dqi: 1.8, state: 'active', meta: { announcedAt: '2023-01', dataVersion: '환경성적표지 평가계수 2021', registeredAt: '2026-05-14', matchNote: '재질 생산 전과정. 포장재 경계' } },
  { id: 'ef3', name: '화물차 수송 (5t 미만)', stage: 'transport', standard: 'iso', value: 0.187, unit: 'kg CO2e/t·km', source: 'GLEC Framework (2023)', version: 'v1', updatedAt: '2026-03-02', updatedBy: 'admin', dqi: 2.4, state: 'active', meta: { effectiveYear: '2023', dataVersion: 'GLEC v3', registeredAt: '2026-03-02', matchNote: 'Tank-to-Wheel, 5t 미만 디젤 화물차' } },
  { id: 'ef4', name: '전력 배출계수', stage: 'manufacturing', standard: 'iso', value: 0.4567, unit: 'kg CO2e/kWh', source: 'EG-TIPS 2025', version: 'v1', updatedAt: '2026-02-10', updatedBy: 'admin', dqi: 1.5, state: 'active', meta: { effectiveYear: '2025', announcedAt: '2025-12-20', dataVersion: 'EG-TIPS 2025', registeredAt: '2026-02-10', matchNote: '계통전력 생산. 2025년 프로젝트 매칭' } },
  { id: 'ef5', name: '전력 배출계수', stage: 'manufacturing', standard: 'iso', value: 0.4412, unit: 'kg CO2e/kWh', source: 'EG-TIPS 2026', version: 'v1', updatedAt: '2026-08-11', updatedBy: 'admin', dqi: 1.5, state: 'pending', effectiveAt: '2026-08-13 09:00', meta: { effectiveYear: '2026', announcedAt: '2026-08-05', dataVersion: 'EG-TIPS 2026', registeredAt: '2026-08-11', matchNote: '계통전력 생산. 2026년 프로젝트 매칭' } },
  { id: 'ef6', name: 'LNG 연소 EF (전력·NCV 조합)', stage: 'manufacturing', standard: 'iso', value: 2.176, unit: 'kg CO2e/Nm³', source: '자동 계산 (연료연소EF × NCV)', version: 'v4', updatedAt: '2026-08-11', updatedBy: '자동재계산', dqi: 1.6, state: 'active', computed: true, meta: { effectiveYear: '2026', dataVersion: 'IPCC 2006 × KOGAS', registeredAt: '2026-08-11', matchNote: '연료원별 사용(제조업). 자동 재계산 항목' } },
  { id: 'ef7', name: '사용단계 전력 (에스프레소머신)', stage: 'usage', standard: 'iso', value: 0.4412, unit: 'kg CO2e/kWh', source: 'EG-TIPS 2026', version: 'v2', updatedAt: '2026-08-11', updatedBy: '자동재계산', dqi: 1.5, state: 'active', computed: true, meta: { effectiveYear: '2026', dataVersion: 'EG-TIPS 2026', registeredAt: '2026-08-11', matchNote: '사용단계 전력. 자동 재계산 항목' } },
  { id: 'ef8', name: '소각 처리 EF (생활폐기물)', stage: 'waste', standard: 'epd', value: 1.1817, unit: 'kg CO2e/kg', source: '환경성적표지 평가계수 2021', version: 'v2', updatedAt: '2026-04-19', updatedBy: 'admin', dqi: 2.2, state: 'active', meta: { announcedAt: '2021', dataVersion: '평가계수 2021', registeredAt: '2026-04-19', matchNote: '처리방식별 원본 EF. 커피박·채프·여과지' } },
  { id: 'ef9', name: '매립 처리 EF (생활폐기물)', stage: 'waste', standard: 'epd', value: 0.4551, unit: 'kg CO2e/kg', source: '환경성적표지 평가계수 2021', version: 'v2', updatedAt: '2026-04-19', updatedBy: 'admin', dqi: 2.2, state: 'active', meta: { announcedAt: '2021', dataVersion: '평가계수 2021', registeredAt: '2026-04-19', matchNote: '처리방식별 원본 EF. 커피박·채프·여과지' } },
];

// EF 버전 이력 (ADM-EF-003)
export interface EfVersion {
  version: string;
  value: number;
  unit: string;
  source: string;
  changedAt: string;
  changedBy: string;
  reason: string;
  dqi: number;
  current?: boolean;
}

export const EF_VERSIONS: EfVersion[] = [
  { version: 'v3', value: 1.92, unit: 'kg CO2e/kg', source: 'Ecoinvent 3.9 (2024)', changedAt: '2026-07-01', changedBy: 'admin', reason: '최신 문헌값 반영', dqi: 2.1, current: true },
  { version: 'v2', value: 1.88, unit: 'kg CO2e/kg', source: 'Ecoinvent 3.8 (2022)', changedAt: '2026-01-15', changedBy: 'admin', reason: '데이터셋 버전 업데이트', dqi: 2.3 },
  { version: 'v1', value: 2.05, unit: 'kg CO2e/kg', source: 'IPCC 기본값 (2019)', changedAt: '2025-09-10', changedBy: 'admin', reason: '초기 등록', dqi: 3.0 },
];

// DQI 6항목 (데이터 품질 평가)
export const DQI_CRITERIA = [
  { key: 'tech', label: '기술적 대표성' },
  { key: 'geo', label: '지리적 대표성' },
  { key: 'time', label: '시간적 대표성' },
  { key: 'precision', label: '정밀성' },
  { key: 'completeness', label: '완전성' },
  { key: 'consistency', label: '일관성' },
] as const;

// ── 기준 데이터 (ADM-MASTER) ─────────────────────────────
export interface MasterDatum {
  id: string;
  category: string;
  name: string;
  value: string;
  unit: string;
  source: string;
  updatedAt: string;
  state: EfState;
  meta?: VersionMeta;
}

export const MASTER_DATA: MasterDatum[] = [
  { id: 'm1', category: '로스팅', name: '로스팅 수율', value: '82', unit: '%', source: '문헌값 (2024)', updatedAt: '2026-06-01', state: 'active', meta: { effectiveYear: '2024', dataVersion: 'Páez et al. 2018', registeredAt: '2026-06-01' } },
  { id: 'm2', category: '로스팅', name: '커피박 함수율', value: '58', unit: '%', source: '문헌값 (2025)', updatedAt: '2026-06-01', state: 'active', meta: { effectiveYear: '2025', dataVersion: 'Moresi & Cimini 2025', registeredAt: '2026-06-01' } },
  { id: 'm3', category: '로스팅', name: '채프 계수', value: '0.05', unit: 'kg/kg', source: '문헌값 (2023)', updatedAt: '2026-06-01', state: 'active', meta: { dataVersion: '문헌 추정치', registeredAt: '2026-06-01' } },
  { id: 'm5', category: '에너지', name: 'LNG NCV', value: '43.6', unit: 'MJ/kg', source: 'IPCC 2006', updatedAt: '2026-02-10', state: 'active', meta: { announcedAt: '2006', dataVersion: 'IPCC 2006', registeredAt: '2026-02-10', matchNote: '연료 물리특성 — 연도 무관 안정' } },
  { id: 'm6', category: '에너지', name: '가스 단위환산계수 (m³→kg)', value: '0.7192', unit: 'kg/m³', source: '한국가스공사(KOGAS)', updatedAt: '2026-02-10', state: 'active', meta: { dataVersion: 'KOGAS 공표값', registeredAt: '2026-02-10' } },
  { id: 'm7', category: '사용단계', name: '에스프레소머신 전력 원단위', value: '0.012', unit: 'kWh/잔', source: '문헌값 (2024)', updatedAt: '2026-06-01', state: 'pending', meta: { effectiveYear: '2024', dataVersion: 'Páez et al. 2018', registeredAt: '2026-06-01' } },
];

// ── 국가 폐기물 처리 비율 (연도별 · 폐기물 성상별) ─────────
// 설계문서 F-2: 성상(폐기물 종류)별로 소각/매립/재활용 비율이 다르며, 연도(stat_year)별로 관리.
// admin이 신규 통계 발표 시 연도 행 세트 추가(덮어쓰기 금지·이력 보존). 각 행 합계 100% 검증.
export interface WasteRatioRow {
  id: string;
  statYear: number; // 적용 기준년도 (stat_year)
  wasteType: string; // 폐기물 성상(종류)
  target: string; // 본 시스템의 대상 폐기물
  incinerate: number; // 소각 %
  landfill: number; // 매립 %
  recycle: number; // 재활용 %
  source: string;
  registeredAt: string; // 등록일
}

export const WASTE_RATIOS: WasteRatioRow[] = [
  // 2024년 (환경부 전국 폐기물 발생 및 처리현황 2024, 정규화) — 현재 적용
  { id: 'wr-2024-1', statYear: 2024, wasteType: '생활폐기물', target: '커피박·채프·여과지', incinerate: 63.72, landfill: 16.27, recycle: 20.01, source: '환경부 전국 폐기물 발생 및 처리현황 2024', registeredAt: '2026-04-19' },
  { id: 'wr-2024-2', statYear: 2024, wasteType: '혼합 폐플라스틱', target: '비닐류 포장재·PP 자루', incinerate: 0, landfill: 0.01, recycle: 99.99, source: '환경부 전국 폐기물 발생 및 처리현황 2024', registeredAt: '2026-04-19' },
  { id: 'wr-2024-3', statYear: 2024, wasteType: '폐지', target: '박스·종이 포장재·황마 자루', incinerate: 0.01, landfill: 0.02, recycle: 99.97, source: '환경부 전국 폐기물 발생 및 처리현황 2024', registeredAt: '2026-04-19' },
  // 2023년 (이전 통계) — 연도별 병존, 2023년 프로젝트 매칭용
  { id: 'wr-2023-1', statYear: 2023, wasteType: '생활폐기물', target: '커피박·채프·여과지', incinerate: 62.10, landfill: 18.40, recycle: 19.50, source: '환경부 전국 폐기물 발생 및 처리현황 2023', registeredAt: '2025-05-02' },
  { id: 'wr-2023-2', statYear: 2023, wasteType: '혼합 폐플라스틱', target: '비닐류 포장재·PP 자루', incinerate: 0, landfill: 0.02, recycle: 99.98, source: '환경부 전국 폐기물 발생 및 처리현황 2023', registeredAt: '2025-05-02' },
  { id: 'wr-2023-3', statYear: 2023, wasteType: '폐지', target: '박스·종이 포장재·황마 자루', incinerate: 0.02, landfill: 0.03, recycle: 99.95, source: '환경부 전국 폐기물 발생 및 처리현황 2023', registeredAt: '2025-05-02' },
];

// 포장재 기준 데이터 (ADM-MASTER-002) — 재질구성비율 합계 100%
export interface PackagingMaterial {
  id: string;
  name: string;
  source: string;
  meta?: VersionMeta;
  composition: { material: string; ratio: number; ef: number }[];
}
export const PACKAGING_MATERIALS: PackagingMaterial[] = [
  {
    id: 'pk1',
    name: '알루미늄 포일',
    source: 'Bayus et al. 2016 (실측)',
    meta: { dataVersion: 'v2.1.2', announcedAt: '2016', registeredAt: '2026-05-14', matchNote: 'PET26/AL30/LDPE44 라미네이트' },
    composition: [
      { material: 'PET', ratio: 26, ef: 2.15 },
      { material: '알루미늄(AL)', ratio: 30, ef: 8.14 },
      { material: 'LDPE', ratio: 44, ef: 1.73 },
    ],
  },
  {
    id: 'pk2',
    name: '증착 필름',
    source: 'Bayus et al. 2016 (실측)',
    meta: { dataVersion: 'v2.1.2', announcedAt: '2016', registeredAt: '2026-05-14', matchNote: 'PET27/VMPET27/LDPE46' },
    composition: [
      { material: 'PET', ratio: 27, ef: 2.15 },
      { material: 'VMPET (증착)', ratio: 27, ef: 2.31 },
      { material: 'LDPE', ratio: 46, ef: 1.73 },
    ],
  },
  {
    id: 'pk3',
    name: '크라프트 페이퍼',
    source: '환경성적표지 평가계수 2021',
    meta: { dataVersion: '평가계수 2021', announcedAt: '2021', registeredAt: '2026-05-14' },
    composition: [
      { material: '크라프트지', ratio: 85, ef: 0.94 },
      { material: 'PE 코팅', ratio: 15, ef: 1.73 },
    ],
  },
];

// ── 참조 데이터셋 (ADM-REF) ───────────────────────────────
export interface WasteFacility {
  id: string;
  name: string;
  address: string;
  method: '소각' | '매립' | '재활용';
  region: string;
  meta?: VersionMeta; // 환경부 DB는 매년 갱신 → 적용연도/버전 관리
}
export const WASTE_FACILITIES: WasteFacility[] = [
  { id: 'wf1', name: '마포 자원회수시설', address: '서울 마포구 상암동 481', method: '소각', region: '서울 마포구', meta: { effectiveYear: '2026', dataVersion: '환경부 2026', registeredAt: '2026-08-05' } },
  { id: 'wf2', name: '수도권매립지 제3-1매립장', address: '인천 서구 백석동 58', method: '매립', region: '인천 서구', meta: { effectiveYear: '2026', dataVersion: '환경부 2026', registeredAt: '2026-08-05' } },
  { id: 'wf3', name: '성남 재활용선별장', address: '경기 성남시 중원구 상대원동', method: '재활용', region: '경기 성남시', meta: { effectiveYear: '2026', dataVersion: '환경부 2026', registeredAt: '2026-08-05' } },
  { id: 'wf4', name: '부산 생활폐기물 소각장', address: '부산 강서구 생곡동', method: '소각', region: '부산 강서구', meta: { effectiveYear: '2025', dataVersion: '환경부 2025', registeredAt: '2025-07-11' } },
];

export interface SubstanceNorm {
  id: string;
  standard: string; // 표준물질명
  aliases: string[]; // 별칭
  efCategory: string; // 연결 EF 카테고리
  meta?: VersionMeta;
}
export const SUBSTANCE_NORMS: SubstanceNorm[] = [
  { id: 'sn1', standard: '생두 (Green coffee bean)', aliases: ['그린빈', '생원두', 'green bean'], efCategory: '원부자재 > 생두', meta: { dataVersion: 'v1.2', registeredAt: '2026-06-01' } },
  { id: 'sn2', standard: '크라프트 페이퍼', aliases: ['크라프트지', '갈색 종이', 'kraft paper'], efCategory: '원부자재 > 포장재', meta: { dataVersion: 'v1.2', registeredAt: '2026-06-01' } },
  { id: 'sn3', standard: 'LNG (액화천연가스)', aliases: ['도시가스', '천연가스', 'natural gas'], efCategory: '제조단계 > 연료연소', meta: { dataVersion: 'v1.3', registeredAt: '2026-07-20' } },
  { id: 'sn4', standard: '전력 (Grid electricity)', aliases: ['한전 전기', '계통전력', 'electricity'], efCategory: '제조단계 > 전력', meta: { dataVersion: 'v1.1', registeredAt: '2026-05-10' } },
];

// ── 감사 로그 (ADM-LOG-001) ───────────────────────────────
export type AuditType = 'ef' | 'master' | 'ref' | 'user' | 'tenant' | 'system' | 'doc';
export const AUDIT_TYPE_LABEL: Record<AuditType, string> = {
  ef: '배출계수',
  master: '기준데이터',
  ref: '참조데이터셋',
  user: '사용자',
  tenant: '조직',
  system: '시스템설정',
  doc: '문서열람',
};

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  type: AuditType;
  action: string;
  target: string;
  before: string;
  after: string;
  reason: string;
}

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'a1', at: '2026-08-11 15:32', actor: 'admin', type: 'ef', action: '신규버전 등록', target: '전력 배출계수 (2026)', before: '0.4567', after: '0.4412', reason: 'EG-TIPS 2026 갱신' },
  { id: 'a2', at: '2026-08-10 11:04', actor: 'admin', type: 'user', action: '계정 정지', target: '최연구 (lab@beanslab.kr)', before: '활성', after: '정지', reason: '휴면 계정 정책' },
  { id: 'a3', at: '2026-08-09 09:20', actor: 'admin', type: 'tenant', action: '조직 정지', target: '아로마로스트', before: '활성', after: '정지', reason: '이용약관 위반 신고' },
  { id: 'a4', at: '2026-08-08 16:41', actor: 'admin', type: 'doc', action: '원본 문서 열람', target: '공드리 로스터리 · 사업자등록증.pdf', before: '-', after: '열람', reason: 'OCR 오류 확인' },
  { id: 'a5', at: '2026-08-06 10:12', actor: 'admin', type: 'master', action: '신규버전 등록', target: '로스팅 수율', before: '80%', after: '82%', reason: '2026 문헌값 반영' },
  { id: 'a6', at: '2026-08-05 14:55', actor: 'admin', type: 'ref', action: 'CSV 일괄 업로드', target: '폐기물 처리시설 위치 DB', before: '312건', after: '318건', reason: '환경부 2026 갱신' },
  { id: 'a7', at: '2026-08-03 08:30', actor: 'admin', type: 'system', action: '세션 만료시간 변경', before: '30분', after: '60분', target: '시스템 설정', reason: '사용자 편의 개선' },
];

// ── 시스템 모니터링 (ADM-SYS-001) ─────────────────────────
export interface MetricCard {
  label: string;
  value: string;
  sub: string;
  tone: 'ok' | 'warn' | 'error';
}
export const MONITORING_METRICS: MetricCard[] = [
  { label: 'OCR 평균 처리시간', value: '2.4초', sub: '목표 3초 이내', tone: 'ok' },
  { label: 'OCR 대기열', value: '3건', sub: '처리 대기중', tone: 'ok' },
  { label: 'API 응답 상태', value: '정상', sub: 'p95 214ms', tone: 'ok' },
  { label: '에러율 (24h)', value: '0.8%', sub: '임계 2% 이내', tone: 'warn' },
];

export interface OcrJob {
  id: string;
  file: string;
  tenant: string;
  status: 'done' | 'processing' | 'fail';
  duration: string;
  at: string;
}
export const OCR_JOBS: OcrJob[] = [
  { id: 'o1', file: '전력고지서_2026-07.pdf', tenant: '공드리 로스터리', status: 'done', duration: '2.1초', at: '2026-08-12 09:12' },
  { id: 'o2', file: '가스고지서_2026-07.jpg', tenant: '빈즈랩 커피', status: 'processing', duration: '—', at: '2026-08-12 09:15' },
  { id: 'o3', file: '사업자등록증.pdf', tenant: '그린빈 컴퍼니', status: 'done', duration: '1.8초', at: '2026-08-12 08:50' },
  { id: 'o4', file: '운송장.jpg', tenant: '아로마로스트', status: 'fail', duration: '—', at: '2026-08-12 08:33' },
];

export interface ErrorLog {
  at: string;
  level: 'ERROR' | 'WARN';
  service: string;
  message: string;
}
export const ERROR_LOGS: ErrorLog[] = [
  { at: '2026-08-12 08:33', level: 'ERROR', service: 'ocr-worker', message: 'Timeout while parsing 운송장.jpg (retry 2/3)' },
  { at: '2026-08-12 06:11', level: 'WARN', service: 'ef-recalc', message: 'Recalculation queued: LNG NCV 기반 항목 4건' },
  { at: '2026-08-11 22:40', level: 'WARN', service: 'api-gateway', message: 'Rate limit near threshold: tenant t2' },
];

// ── 대시보드 요약 (ADM-DASH-001, 제안) ────────────────────
export const DASHBOARD_STATS = {
  tenants: TENANTS.length,
  activeUsers: ADMIN_USERS.filter((u) => u.status === 'active').length,
  ongoingProjects: 9,
  pendingFactors: EMISSION_FACTORS.filter((e) => e.state === 'pending').length + MASTER_DATA.filter((m) => m.state === 'pending').length,
};
