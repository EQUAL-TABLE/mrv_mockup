import { CheckCircle2, Cpu, PencilLine, Target } from 'lucide-react';
import type { ComponentType } from 'react';
import { Badge } from '@/components/ui/Badge';
import { STEP_INTRO } from '@/data/stepIntro';
import type { WorkflowStep } from '@/data/workflow';

/** 단계 설명 영역 (비전문가 눈높이: 목적 / 입력 / 결과) */
export function StepIntro({ stepKey, steps }: { stepKey: string; steps: WorkflowStep[] }) {
  const index = steps.findIndex((s) => s.key === stepKey);
  const step = steps[index];
  const c = STEP_INTRO[stepKey];

  if (!step) return null;

  return (
    <section className="rounded-lg border border-primary/30 bg-primary/5 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {index + 1}
        </span>
        <h2 className="text-base font-bold text-on-surface">{step.title}</h2>
        {step.auto && (
          <Badge variant="neutral">
            <Cpu className="h-3 w-3" /> 자동 계산 단계
          </Badge>
        )}
      </div>

      {c && (
        <>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{c.summary}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <IntroItem Icon={Target} label="이 단계의 목적" text={c.purpose} />
            <IntroItem Icon={PencilLine} label="입력하는 정보" text={c.inputs} />
            <IntroItem Icon={CheckCircle2} label="얻는 결과" text={c.result} />
          </div>
        </>
      )}
    </section>
  );
}

function IntroItem({ Icon, label, text }: { Icon: ComponentType<{ className?: string }>; label: string; text: string }) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-lowest p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{text}</p>
    </div>
  );
}
