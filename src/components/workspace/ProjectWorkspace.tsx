import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Badge, StatusChip } from '@/components/ui/Badge';
import { SourceLegend } from '@/components/ui/form';
import { Stepper } from '@/components/workspace/Stepper';
import { StepActions } from '@/components/workspace/StepActions';
import { StepIntro } from '@/components/workspace/StepIntro';
import { getSteps, resolveWorkflowId } from '@/data/workflow';
import { resolveProjectMeta } from '@/data/projects';
import { BOUNDARY_LABEL, METHODOLOGY_LABEL, STATUS_LABEL, TRACK_LABEL, type ProjectStatus } from '@/types/project';

interface ProjectWorkspaceProps {
  projectId: string;
  stepKey: string;
  children: ReactNode;
}

const STATUS_TONE: Record<ProjectStatus, 'neutral' | 'warning' | 'primary'> = {
  draft: 'neutral',
  review: 'warning',
  finalized: 'primary',
  done: 'primary',
};

/** 프로젝트 작업 화면 프레임: 헤더 + 상단 스텝 네비 + 단계 설명 + 내용 + 하단 액션 */
export function ProjectWorkspace({ projectId, stepKey, children }: ProjectWorkspaceProps) {
  const project = resolveProjectMeta(projectId);
  const workflowId = resolveWorkflowId(project.track, project.methodology, project.boundary);
  const steps = getSteps(workflowId);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        {/* 프로젝트 헤더 */}
        <div>
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> 프로젝트 목록
          </Link>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-on-surface">{project.name}</h1>
              <StatusChip label={STATUS_LABEL[project.status]} tone={STATUS_TONE[project.status]} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={project.track === 'calculator' ? 'warning' : 'primary'}>{TRACK_LABEL[project.track]}</Badge>
              {project.track !== 'calculator' && <Badge>{METHODOLOGY_LABEL[project.methodology]}</Badge>}
              <Badge>{BOUNDARY_LABEL[project.boundary]}</Badge>
              <Badge variant="neutral">전체 {steps.length}단계</Badge>
            </div>
          </div>
        </div>

        {/* 상단 스텝 네비 */}
        <Stepper projectId={projectId} currentKey={stepKey} steps={steps} />

        {/* 단계 설명 (비전문가 눈높이) + 출처 등급 범례(MRV 전용) + 내용 */}
        <div className="space-y-4">
          <StepIntro stepKey={stepKey} steps={steps} />
          {project.track !== 'calculator' && <SourceLegend />}
          {children}
        </div>

        {/* 하단 액션 */}
        <StepActions projectId={projectId} currentKey={stepKey} steps={steps} />
      </div>
    </AppShell>
  );
}
