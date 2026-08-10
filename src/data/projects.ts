import type { Project } from '@/types/project';

/** 작업 화면에서 참조하는 프로젝트 핵심 메타 */
export type ProjectMeta = Pick<Project, 'name' | 'track' | 'methodology' | 'boundary' | 'status'>;

/** 신규 프로젝트 기본값 (아직 저장 전) */
export const NEW_PROJECT_META: ProjectMeta = {
  name: '새 탄소 산정 (미저장)',
  track: 'mrv',
  methodology: 'iso',
  boundary: 'grave',
  status: 'draft',
};

/** 홈 목록 목업용 샘플 데이터 */
export const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: '에티오피아 예가체프 싱글오리진 2026',
    track: 'mrv',
    methodology: 'iso',
    boundary: 'grave',
    status: 'draft',
    progress: { current: 6, total: 12 },
    createdAt: '2026-06-01',
    updatedAt: '2026-08-05',
  },
  {
    id: 'p2',
    name: '콜드브루 원액용 블렌드 2026',
    track: 'mrv',
    methodology: 'iso',
    boundary: 'grave',
    status: 'review',
    progress: { current: 11, total: 12 },
    createdAt: '2026-07-20',
    updatedAt: '2026-08-06',
  },
  {
    id: 'p3',
    name: '디카페인 하우스블렌드 2026',
    track: 'mrv',
    methodology: 'iso',
    boundary: 'gate',
    status: 'finalized',
    progress: { current: 10, total: 10 },
    result: 4.21,
    createdAt: '2026-05-20',
    updatedAt: '2026-07-28',
  },
  {
    id: 'p4',
    name: '시그니처 블렌드 2026',
    track: 'mrv',
    methodology: 'epd',
    boundary: 'grave',
    status: 'draft',
    progress: { current: 3, total: 10 },
    createdAt: '2026-07-28',
    updatedAt: '2026-08-04',
  },
  {
    id: 'p5',
    name: '케냐 AA 간편 계산',
    track: 'calculator',
    methodology: 'iso',
    boundary: 'gate',
    status: 'done',
    progress: { current: 6, total: 6 },
    result: 5.02,
    createdAt: '2026-08-01',
  },
  {
    id: 'p6',
    name: '홀빈 세트 간편 계산 (폐기까지)',
    track: 'calculator',
    methodology: 'iso',
    boundary: 'grave',
    status: 'draft',
    progress: { current: 2, total: 7 },
    createdAt: '2026-08-06',
  },
];

/** id로 프로젝트 메타 조회 (없으면 신규 기본값) */
export function resolveProjectMeta(id: string): ProjectMeta {
  return SAMPLE_PROJECTS.find((p) => p.id === id) ?? NEW_PROJECT_META;
}
