// 프로젝트 도메인 타입 (설계 문서 기준)

/** 산정 유형(트랙): MRV = 고지서 기반, calculator = 추정치 계산기 */
export type Track = 'mrv' | 'calculator';
/** 방법론 */
export type Methodology = 'iso' | 'epd';
/** 시스템 경계: gate = 제품 생산까지(C2Gate), grave = 폐기까지(C2Grave) */
export type Boundary = 'gate' | 'grave';
/** 진행 상태 */
export type ProjectStatus = 'draft' | 'review' | 'finalized' | 'done';

export interface Project {
  id: string;
  name: string;
  track: Track;
  methodology: Methodology;
  boundary: Boundary;
  status: ProjectStatus;
  /** 12단계 등 워크플로우 진행 단계 */
  progress: { current: number; total: number };
  /** 최종/추정 CFP 결과 (kg CO2e / 1kg RC). 완료 상태에서만 존재 */
  result?: number;
  createdAt: string;
  updatedAt?: string;
}

// ── 라벨 매핑 (사용자 확정 용어) ───────────────────────────
export const TRACK_LABEL: Record<Track, string> = {
  mrv: 'MRV',
  calculator: '계산기',
};

export const METHODOLOGY_LABEL: Record<Methodology, string> = {
  iso: 'ISO 14067',
  epd: '환경성적표지',
};

export const BOUNDARY_LABEL: Record<Boundary, string> = {
  gate: '제품 생산까지',
  grave: '폐기까지',
};

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: '작성중',
  review: '검토중',
  finalized: '완료',
  done: '완료',
};
