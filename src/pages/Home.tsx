import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { SystemIntro } from '@/components/SystemIntro';
import { ProjectCard } from '@/components/ProjectCard';
import { StatusChip } from '@/components/ui/Badge';
import type { Project } from '@/types/project';
import { SAMPLE_PROJECTS } from '@/data/projects';

interface HomeProps {
  /** 빈 화면(첫 사용자) 데모용 */
  empty?: boolean;
}

export function Home({ empty = false }: HomeProps) {
  const navigate = useNavigate();
  const projects: Project[] = empty ? [] : SAMPLE_PROJECTS;

  const startNew = () => navigate('/start');
  const openProject = (id: string) => navigate(`/projects/${id}/basic`);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <SystemIntro onStart={startNew} />

        <section>
          <ListHeader projects={projects} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={openProject} />
            ))}
            <AddCard onClick={startNew} />
          </div>
        </section>

        {/* 목업 검토용 상태 전환 링크 (실제 화면 미포함) */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => navigate(empty ? '/' : '/first')}
            className="text-xs text-on-surface-variant underline hover:text-primary"
          >
            ▸ {empty ? '프로젝트가 있는 홈 화면 보기' : '첫 사용자(프로젝트 없음) 화면 보기'}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

/** 목록 헤더 + 상태 요약 */
function ListHeader({ projects }: { projects: Project[] }) {
  const count = (fn: (p: Project) => boolean) => projects.filter(fn).length;
  const drafting = count((p) => p.status === 'draft');
  const reviewing = count((p) => p.status === 'review');
  const finished = count((p) => p.status === 'finalized' || p.status === 'done');

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-on-surface">프로젝트 목록</h2>
        <p className="mt-0.5 text-sm text-on-surface-variant">총 {projects.length}건</p>
      </div>
      <div className="flex items-center gap-2">
        <StatusChip label={`작성중 ${drafting}`} tone="neutral" />
        <StatusChip label={`검토중 ${reviewing}`} tone="warning" />
        <StatusChip label={`완료 ${finished}`} tone="primary" />
      </div>
    </div>
  );
}

/** 새 프로젝트 추가 카드 (점선) */
function AddCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant bg-surface-container-low/40 p-5 text-on-surface-variant transition hover:border-primary hover:text-primary"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-outline-variant bg-surface-container-lowest">
        <Plus className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold">탄소발자국 산정</span>
    </button>
  );
}
