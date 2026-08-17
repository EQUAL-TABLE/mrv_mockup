import { useParams, useSearchParams } from 'react-router-dom';
import { ProjectWorkspace } from '@/components/workspace/ProjectWorkspace';
import { BasicInfo } from '@/pages/project/BasicInfo';
import { CalcManufacturing, CalcMaterials, CalcResult, CalcTransport, CalcUsage, CalcWaste } from '@/pages/project/calc';
import { MrvManufacturing } from '@/pages/project/Manufacturing';
import { Documents } from '@/pages/project/Documents';
import { Materials } from '@/pages/project/Materials';
import { Transport } from '@/pages/project/Transport';
import { MassContribution } from '@/pages/project/MassContribution';
import { Distribution } from '@/pages/project/Distribution';
import { Waste } from '@/pages/project/Waste';
import { Review } from '@/pages/project/Review';
import { Result } from '@/pages/project/Result';
import { Usage } from '@/pages/project/Usage';
import { WasteTransport } from '@/pages/project/WasteTransport';
import { ALL_STEPS } from '@/data/workflow';
import { resolveProjectMeta } from '@/data/projects';
import { resolveProjectData } from '@/data/projectData';
import type { ProjectMeta } from '@/data/projects';
import type { ProjectData } from '@/data/projectData';
import type { Boundary, Methodology, Track } from '@/types/project';

/** 프로젝트 작업 화면 라우트 (/projects/:id/:step) */
export function ProjectPage() {
  const { id, step } = useParams();
  const [params] = useSearchParams();
  const projectId = id ?? 'new';
  const stepKey = step ?? 'basic';
  const meta = withWizardChoices(resolveProjectMeta(projectId), projectId, params);
  const data = resolveProjectData(projectId);

  return (
    <ProjectWorkspace projectId={projectId} stepKey={stepKey}>
      {renderStep(stepKey, meta, data, projectId)}
    </ProjectWorkspace>
  );
}

/**
 * 신규 프로젝트는 시작 위저드/서비스 안내에서 넘어온 선택(track·methodology·boundary)을
 * 쿼리 파라미터로 받아 반영한다. (계산기=방법론 무관, 환경성적표지=폐기까지 규칙도 정규화)
 */
function withWizardChoices(meta: ProjectMeta, projectId: string, params: URLSearchParams): ProjectMeta {
  if (projectId !== 'new') return meta;

  const track: Track = params.get('track') === 'calculator' ? 'calculator' : meta.track;
  let methodology: Methodology = params.get('methodology') === 'epd' ? 'epd' : params.get('methodology') === 'iso' ? 'iso' : meta.methodology;
  let boundary: Boundary = params.get('boundary') === 'gate' ? 'gate' : params.get('boundary') === 'grave' ? 'grave' : meta.boundary;

  if (track === 'calculator') methodology = 'iso'; // 계산기는 방법론 미표시 (내부 기본값만 유지)
  if (methodology === 'epd') boundary = 'grave'; // 환경성적표지는 폐기까지 고정

  return { ...meta, track, methodology, boundary };
}

function renderStep(stepKey: string, meta: ProjectMeta, data: ProjectData, projectId: string) {
  if (stepKey === 'basic')
    return (
      <BasicInfo
        initialTrack={meta.track}
        initialMethodology={meta.methodology}
        initialBoundary={meta.boundary}
        name={projectId === 'new' ? '' : meta.name}
        data={data}
      />
    );

  // 계산기 트랙 화면
  if (meta.track === 'calculator') {
    switch (stepKey) {
      case 'materials':
        return <CalcMaterials boundary={meta.boundary} data={data} />;
      case 'transport':
        return <CalcTransport boundary={meta.boundary} />;
      case 'manufacturing':
        return <CalcManufacturing fuel={data.production.fuel} />;
      case 'usage':
        return <CalcUsage data={data} />;
      case 'waste':
        return <CalcWaste boundary={meta.boundary} />;
      case 'result':
        return <CalcResult boundary={meta.boundary} data={data} />;
    }
  }

  // MRV 트랙 화면 (방법론·경계에 따라 화면 구성 분기)
  // ⑥제조단계는 방법론·경계와 무관하게 동일한 공통 화면.
  const p = { methodology: meta.methodology, boundary: meta.boundary };
  switch (stepKey) {
    case 'documents':
      return <Documents {...p} status={meta.status} farmProofCount={data.farms.filter((f) => f.proof).length} />;
    case 'materials':
      return <Materials {...p} data={data} />;
    case 'transport':
      return <Transport {...p} data={data} />;
    case 'mass':
      return <MassContribution {...p} data={data} />;
    case 'manufacturing':
      return <MrvManufacturing data={data} />;
    case 'distribution':
      return <Distribution />;
    case 'usage':
      return <Usage data={data} />;
    case 'waste-transport':
      return <WasteTransport boundary={meta.boundary} />;
    case 'waste':
      return <Waste {...p} />;
    case 'review':
      return <Review methodology={meta.methodology} />;
    case 'result':
      return <Result {...p} data={data} />;
  }

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
