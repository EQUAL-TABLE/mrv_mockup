import { Check, Cpu } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DEMO_STATUS, type WorkflowStep } from '@/data/workflow';

interface StepperProps {
  projectId: string;
  currentKey: string;
  steps: WorkflowStep[];
}

/** 상단 스텝 네비 (카드형): 단계 이름 + 필수/OCR 완료 배지. 가로 스크롤. */
export function Stepper({ projectId, currentKey, steps }: StepperProps) {
  return (
    <nav className="custom-scrollbar overflow-x-auto pb-1">
      <ol className="flex min-w-max items-stretch gap-2">
        {steps.map((s, i) => {
          const isCurrent = s.key === currentKey;
          return (
            <li key={s.key}>
              <Link
                to={`/projects/${projectId}/${s.key}`}
                className={cn(
                  'flex h-full w-fit flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 text-center transition',
                  isCurrent
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-high',
                )}
              >
                <span className={cn('text-[11px] font-semibold', isCurrent ? 'text-primary' : 'text-on-surface-variant')}>
                  {isCurrent ? '진행 중' : `STEP ${i + 1}`}
                </span>
                <p className="whitespace-nowrap text-sm font-bold text-on-surface">{s.label}</p>
                <div className="flex flex-nowrap gap-1">
                  <StepBadges step={s} />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** 단계별 상태 배지 */
function StepBadges({ step }: { step: WorkflowStep }) {
  if (step.auto) return <MiniBadge tone="muted"><Cpu className="h-3 w-3" /> 자동 계산</MiniBadge>;
  if (step.key === 'review') return <MiniBadge tone="muted">점검 단계</MiniBadge>;
  if (step.key === 'result') return <MiniBadge tone="muted">결과 확인</MiniBadge>;

  const status = DEMO_STATUS[step.key] ?? {};
  return (
    <>
      {step.req && (
        <MiniBadge tone={status.req === 'done' ? 'done' : 'attention'}>
          {status.req === 'done' ? <><Check className="h-3 w-3" /> 필수 완료</> : '필수 미입력'}
        </MiniBadge>
      )}
      {step.ocr && (
        <MiniBadge tone={status.ocr === 'done' ? 'done' : 'muted'}>
          {status.ocr === 'done' ? <><Check className="h-3 w-3" /> OCR 완료</> : 'OCR 대기'}
        </MiniBadge>
      )}
    </>
  );
}

type MiniTone = 'done' | 'attention' | 'muted';

const MINI_CLASS: Record<MiniTone, string> = {
  done: 'bg-primary text-white',
  attention: 'border border-warning/50 bg-warning/10 text-warning',
  muted: 'bg-surface-container-high text-on-surface-variant',
};

function MiniBadge({ tone, children }: { tone: MiniTone; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold', MINI_CLASS[tone])}>
      {children}
    </span>
  );
}
