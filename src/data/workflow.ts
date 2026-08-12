import type { Boundary, Methodology, Track } from '@/types/project';

/** 프로젝트 진행 단계(워크플로우) 정의 */

export interface WorkflowStep {
  key: string;
  /** 스텝 네비 짧은 라벨 */
  label: string;
  /** 화면 전체 제목 */
  title: string;
  /** LCA 묶음 */
  phase: string;
  /** 자동 계산(읽기전용) 단계 */
  auto?: boolean;
  /** 필수 정보 입력이 있는 단계 */
  req?: boolean;
  /** 증빙 문서(OCR) 업로드가 있는 단계 */
  ocr?: boolean;
}

/** 전체 12단계 마스터 정의 (표준 순서) */
export const ALL_STEPS: WorkflowStep[] = [
  { key: 'basic', label: '기본정보', title: '프로젝트 기본정보', phase: '준비', req: true },
  { key: 'documents', label: '문서 업로드', title: '증빙 문서 업로드', phase: '준비', ocr: true },
  { key: 'materials', label: '원부자재', title: '제조 전 단계 · 원부자재', phase: '제조 전', req: true, ocr: true },
  { key: 'transport', label: '원료 수송', title: '제조 전 단계 · 원료 수송', phase: '제조 전', req: true, ocr: true },
  { key: 'mass', label: '질량기여도', title: '누적 질량 기여도', phase: '제조 전', auto: true },
  { key: 'manufacturing', label: '제조', title: '제조 단계', phase: '제조', req: true, ocr: true },
  { key: 'distribution', label: '제품 유통', title: '제품 유통', phase: '제조 후', req: true, ocr: true },
  { key: 'usage', label: '사용', title: '사용 단계', phase: '제조 후', auto: true },
  { key: 'waste-transport', label: '폐기 수송', title: '폐기 단계 · 수송', phase: '제조 후', auto: true },
  { key: 'waste', label: '폐기 처리', title: '폐기 단계 · 처리', phase: '제조 후', req: true, ocr: true },
  { key: 'review', label: '검토', title: '검토', phase: '마무리' },
  { key: 'result', label: '결과', title: '결과', phase: '마무리' },
];

const STEP_MAP: Record<string, WorkflowStep> = Object.fromEntries(ALL_STEPS.map((s) => [s.key, s]));

export type WorkflowId = 'mrv-epd' | 'mrv-iso-gate' | 'mrv-iso-grave' | 'calc-gate' | 'calc-grave';

/** 설계 문서 매트릭스에 따른 워크플로우별 단계 구성 (순서 포함) */
export const WORKFLOWS: Record<WorkflowId, string[]> = {
  'mrv-iso-grave': ['basic', 'documents', 'materials', 'transport', 'mass', 'manufacturing', 'distribution', 'usage', 'waste-transport', 'waste', 'review', 'result'],
  'mrv-iso-gate': ['basic', 'documents', 'materials', 'transport', 'mass', 'manufacturing', 'waste-transport', 'waste', 'review', 'result'],
  'mrv-epd': ['basic', 'documents', 'materials', 'transport', 'mass', 'manufacturing', 'distribution', 'waste', 'review', 'result'],
  'calc-grave': ['basic', 'materials', 'transport', 'manufacturing', 'usage', 'waste', 'result'],
  'calc-gate': ['basic', 'materials', 'transport', 'manufacturing', 'waste', 'result'],
};

/** 트랙·방법론·경계 → 워크플로우 결정 (환경성적표지는 항상 폐기까지, 계산기는 항상 ISO) */
export function resolveWorkflowId(track: Track, methodology: Methodology, boundary: Boundary): WorkflowId {
  if (track === 'calculator') return boundary === 'gate' ? 'calc-gate' : 'calc-grave';
  if (methodology === 'epd') return 'mrv-epd';
  return boundary === 'gate' ? 'mrv-iso-gate' : 'mrv-iso-grave';
}

/** 워크플로우의 순서대로 단계 목록 반환 */
export function getSteps(id: WorkflowId): WorkflowStep[] {
  return WORKFLOWS[id].map((key) => STEP_MAP[key]);
}

/** 워크플로우(조합)별 요약 설명 */
export const WORKFLOW_META: Record<WorkflowId, { title: string; summary: string; certify: boolean }> = {
  'mrv-iso-grave': {
    title: 'MRV · ISO 14067 · 폐기까지',
    summary:
      '증빙을 기반으로 커피의 전 생애(재배~폐기)를 국제표준 ISO 14067로 산정하고, 검토·확정을 거쳐 인증용 문서를 발급합니다. 모든 단계를 포함하는 가장 완전한 흐름입니다.',
    certify: true,
  },
  'mrv-iso-gate': {
    title: 'MRV · ISO 14067 · 제품 생산까지',
    summary:
      '증빙을 기반으로 생두 재배부터 제품 생산 완료까지를 국제표준으로 산정합니다. 제품 유통·소비자 사용 단계가 제외되어 조금 더 짧게 진행됩니다.',
    certify: true,
  },
  'mrv-epd': {
    title: 'MRV · 환경성적표지 · 폐기까지',
    summary:
      '증빙을 기반으로 국내 환경성적표지 중 탄소발자국 기준에 맞춰 산정합니다. 소비자 사용·폐기 수송 단계가 제외되는 등 표준 고유의 규칙을 따릅니다.',
    certify: true,
  },
  'calc-grave': {
    title: '계산기 · 폐기까지',
    summary:
      '증빙 없이 값을 직접 입력해 재배부터 폐기까지를 추정합니다. 문서 업로드·검토·확정이 없어 간단하며, 결과는 인증 불가한 참고용입니다.',
    certify: false,
  },
  'calc-gate': {
    title: '계산기 · 제품 생산까지',
    summary:
      '증빙 없이 값을 직접 입력해 제품 생산까지를 추정합니다. 가장 간단한 흐름이며, 결과는 인증 불가한 참고용입니다.',
    certify: false,
  },
};

export type StepFlag = 'done' | 'todo';

/** 데모용 단계별 완료 상태 (작성중 프로젝트 예시) */
export const DEMO_STATUS: Record<string, { req?: StepFlag; ocr?: StepFlag }> = {
  basic: { req: 'done' },
  documents: { ocr: 'done' },
  materials: { req: 'todo', ocr: 'done' },
  transport: { req: 'todo', ocr: 'todo' },
  manufacturing: { req: 'todo', ocr: 'todo' },
  distribution: { req: 'todo', ocr: 'todo' },
  waste: { req: 'todo', ocr: 'todo' },
};
