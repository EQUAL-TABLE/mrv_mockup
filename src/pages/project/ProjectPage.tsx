import { useParams, useSearchParams } from 'react-router-dom';
import { ProjectWorkspace } from '@/components/workspace/ProjectWorkspace';
import { BasicInfo } from '@/pages/project/BasicInfo';
import { CalcManufacturing, CalcMaterials, CalcResult, CalcTransport, CalcUsage, CalcWaste } from '@/pages/project/calc';
import { ALL_STEPS } from '@/data/workflow';
import { resolveProjectMeta } from '@/data/projects';
import type { ProjectMeta } from '@/data/projects';
import type { Boundary, Methodology, Track } from '@/types/project';

/** 프로젝트 작업 화면 라우트 (/projects/:id/:step) */
export function ProjectPage() {
  const { id, step } = useParams();
  const [params] = useSearchParams();
  const projectId = id ?? 'new';
  const stepKey = step ?? 'basic';
  const meta = withWizardChoices(resolveProjectMeta(projectId), projectId, params);

  return (
    <ProjectWorkspace projectId={projectId} stepKey={stepKey}>
      {renderStep(stepKey, meta)}
    </ProjectWorkspace>
  );
}

/**
 * 신규 프로젝트는 시작 위저드/서비스 안내에서 넘어온 선택(track·methodology·boundary)을
 * 쿼리 파라미터로 받아 반영한다. (계산기=ISO, 환경성적표지=폐기까지 규칙도 정규화)
 */
function withWizardChoices(meta: ProjectMeta, projectId: string, params: URLSearchParams): ProjectMeta {
  if (projectId !== 'new') return meta;

  const track: Track = params.get('track') === 'calculator' ? 'calculator' : meta.track;
  let methodology: Methodology = params.get('methodology') === 'epd' ? 'epd' : params.get('methodology') === 'iso' ? 'iso' : meta.methodology;
  let boundary: Boundary = params.get('boundary') === 'gate' ? 'gate' : params.get('boundary') === 'grave' ? 'grave' : meta.boundary;

  if (track === 'calculator') methodology = 'iso'; // 계산기는 ISO 고정
  if (methodology === 'epd') boundary = 'grave'; // 환경성적표지는 폐기까지 고정

  return { ...meta, track, methodology, boundary };
}

function renderStep(stepKey: string, meta: ProjectMeta) {
  if (stepKey === 'basic')
    return <BasicInfo initialTrack={meta.track} initialMethodology={meta.methodology} initialBoundary={meta.boundary} />;

  // 계산기 트랙 화면
  if (meta.track === 'calculator') {
    switch (stepKey) {
      case 'materials':
        return <CalcMaterials boundary={meta.boundary} />;
      case 'transport':
        return <CalcTransport boundary={meta.boundary} />;
      case 'manufacturing':
        return <CalcManufacturing />;
      case 'usage':
        return <CalcUsage />;
      case 'waste':
        return <CalcWaste boundary={meta.boundary} />;
      case 'result':
        return <CalcResult boundary={meta.boundary} />;
    }
  }

  // MRV 트랙 화면은 순차 구현 예정
  const found = ALL_STEPS.find((s) => s.key === stepKey);
  return <StepPlaceholder title={found?.title ?? '해당 단계'} />;
}

/** 아직 만들지 않은 단계 자리표시 */
function StepPlaceholder({ title }: { title: string }) {
  return (
    <section className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low/40 p-12 text-center">
      <p className="text-sm font-semibold text-on-surface">{title} 화면은 준비 중입니다</p>
      <p className="mt-1 text-sm text-on-surface-variant">
        이 단계는 곧 목업으로 추가됩니다. 상단 스텝에서 다른 단계를 확인할 수 있습니다.
      </p>
    </section>
  );
}
