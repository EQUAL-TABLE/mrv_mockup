import { ArrowRight, BarChart3, ClipboardCheck, PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge, StatusChip } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  BOUNDARY_LABEL,
  METHODOLOGY_LABEL,
  STATUS_LABEL,
  TRACK_LABEL,
  type Project,
  type ProjectStatus,
} from '@/types/project';

function getAction(status: ProjectStatus) {
  switch (status) {
    case 'draft':
      return { label: '이어서 작성', Icon: PencilLine };
    case 'review':
      return { label: '검토 이어가기', Icon: ClipboardCheck };
    case 'finalized':
    case 'done':
      return { label: '결과 보기', Icon: BarChart3 };
  }
}

const STATUS_TONE: Record<ProjectStatus, 'neutral' | 'warning' | 'primary'> = {
  draft: 'neutral',
  review: 'warning',
  finalized: 'primary',
  done: 'primary',
};

interface ProjectCardProps {
  project: Project;
  onOpen?: (id: string) => void;
}

/**
 * 홈 프로젝트 목록 카드 (상태에 따라 내용만 바뀌는 단일 재사용 컴포넌트).
 * 신뢰도 톤: rounded-lg, 1px 헤어라인 보더, 그림자 없음, 단색 버튼.
 */
export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const {
    id, name, track, methodology, boundary, status, progress, result, createdAt, updatedAt,
  } = project;

  const isCalculator = track === 'calculator';
  const isDone = status === 'finalized' || status === 'done';
  const isReview = status === 'review';
  const action = getAction(status);
  const percent = Math.round((progress.current / progress.total) * 100);

  return (
    <article className="flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-5 transition hover:border-outline-variant/40 hover:bg-surface-container-low/40">
      {/* 헤더: 이름 + 상태 */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold leading-snug text-on-surface">{name}</h3>
        <StatusChip label={STATUS_LABEL[status]} tone={STATUS_TONE[status]} />
      </div>

      {/* 메타 태그: 트랙/방법론/경계 */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Badge variant={isCalculator ? 'warning' : 'primary'}>{TRACK_LABEL[track]}</Badge>
        <Badge>{METHODOLOGY_LABEL[methodology]}</Badge>
        <Badge>{BOUNDARY_LABEL[boundary]}</Badge>
      </div>

      {/* 진행/결과 (flex-1로 높이 균일화) */}
      <div className="mt-4 flex-1">
        {isDone ? (
          <ResultBlock result={result} isCalculator={isCalculator} />
        ) : (
          <>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-on-surface-variant">진행 단계</span>
              <span className={cn('font-semibold tabular-nums', isReview ? 'text-warning' : 'text-primary')}>
                {progress.current} / {progress.total} 단계{isReview ? ' · 검토 중' : ''}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div
                className={cn('h-full rounded-full', isReview ? 'bg-warning' : 'bg-primary')}
                style={{ width: `${percent}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* 푸터: 날짜 + 액션 */}
      <div className="mt-4 border-t border-outline-variant pt-3">
        <p className="mb-3 text-xs text-on-surface-variant tabular-nums">
          생성 {createdAt}
          {updatedAt ? ` · 수정 ${updatedAt}` : ''}
        </p>
        <Button variant="primary" className="w-full" onClick={() => onOpen?.(id)}>
          <action.Icon className="h-4 w-4" />
          {action.label}
          <ArrowRight className="h-4 w-4 opacity-70" />
        </Button>
      </div>
    </article>
  );
}

/** 완료 상태 결과값 (라벨 + 숫자를 같은 열에 크기만 다르게) */
function ResultBlock({ result, isCalculator }: { result?: number; isCalculator: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium text-on-surface-variant">
          {isCalculator ? '추정 결과 (참고용)' : '탄소발자국 결과'}
        </p>
        {isCalculator && <Badge variant="warning">인증 불가</Badge>}
      </div>
      <p className="mt-1">
        <span className={cn('text-2xl font-bold tabular-nums', isCalculator ? 'text-on-surface' : 'text-primary')}>
          {result?.toFixed(2)}
        </span>{' '}
        <span className="text-sm font-medium text-on-surface-variant">kg CO₂e/kg</span>
      </p>
    </div>
  );
}
