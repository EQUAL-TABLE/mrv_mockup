import { Check, ChevronRight, Coffee, Cpu, FileText, Flame, Package, Plus, ScanLine, Ship, Sprout, Trash2, Truck } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AppShell } from '@/components/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MRV_DOCUMENTS } from '@/data/trackGuide';
import { AXES, LCA_INTRO, LIFECYCLE, type LifecyclePhase } from '@/data/lcaConcept';
import { STEP_INTRO } from '@/data/stepIntro';
import { WORKFLOW_META, getSteps, resolveWorkflowId, type WorkflowStep } from '@/data/workflow';
import type { Boundary, Methodology, Track } from '@/types/project';

export function TrackGuide() {
  const navigate = useNavigate();
  const [track, setTrack] = useState<Track>('mrv');
  const [methodology, setMethodology] = useState<Methodology>('iso');
  const [boundary, setBoundary] = useState<Boundary>('grave');

  const onTrack = (t: Track) => {
    setTrack(t);
    if (t === 'calculator') setMethodology('iso');
  };
  const onMethodology = (m: Methodology) => {
    setMethodology(m);
    if (m === 'epd') setBoundary('grave');
  };

  const workflowId = resolveWorkflowId(track, methodology, boundary);
  const meta = WORKFLOW_META[workflowId];
  const steps = getSteps(workflowId);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <h1 className="text-lg font-bold text-on-surface">서비스 안내</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          커피 탄소회계가 무엇인지 이해하고, 나에게 맞는 산정 방식을 선택하세요.
        </p>

        {/* 개념: LCA 관점 커피 탄소회계 */}
        <ConceptSection />

        {/* 시작할 때 정하는 3가지 (트랙·방법론·경계) */}
        <AxesSection />

        {/* 방식별 상세 진행 단계 */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-on-surface">방식별 상세 진행 단계</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            아래에서 방식·표준·범위를 골라 보세요. 선택한 조합이 실제로 어떤 순서로 진행되는지 바로 확인할 수 있습니다.
          </p>
        </div>

        {/* 3가지 선택기 */}
        <div className="mt-4 space-y-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
          <SelectorRow label="산정 방식">
            <Segmented
              value={track}
              onChange={onTrack}
              options={[
                { value: 'mrv', label: 'MRV 기반' },
                { value: 'calculator', label: '계산기' },
              ]}
            />
          </SelectorRow>
          <SelectorRow label="방법론">
            <Segmented
              value={methodology}
              onChange={onMethodology}
              options={[
                { value: 'iso', label: 'ISO 14067', disabled: track === 'calculator' },
                { value: 'epd', label: '환경성적표지', disabled: track === 'calculator' },
              ]}
            />
            {track === 'calculator' && (
              <p className="mt-1.5 text-xs text-on-surface-variant">계산기 방식은 방법론을 선택하지 않고 ISO 14067이 자동 적용됩니다.</p>
            )}
          </SelectorRow>
          <SelectorRow label="산정 범위">
            <Segmented
              value={boundary}
              onChange={setBoundary}
              options={[
                { value: 'gate', label: '제품 생산까지', disabled: methodology === 'epd' },
                { value: 'grave', label: '폐기까지' },
              ]}
            />
            {methodology === 'epd' && (
              <p className="mt-1.5 text-xs text-on-surface-variant">환경성적표지는 범위가 ‘폐기까지’로 고정됩니다.</p>
            )}
          </SelectorRow>
        </div>

        {/* 선택 조합 결과 */}
        <WorkflowDetail
          title={meta.title}
          summary={meta.summary}
          certify={meta.certify}
          isMrv={track === 'mrv'}
          steps={steps}
          onStart={() =>
            navigate(`/projects/new/basic?track=${track}&methodology=${methodology}&boundary=${boundary}`)
          }
        />
      </div>
    </AppShell>
  );
}

/* ────────────────── 개념 섹션 ────────────────── */

function ConceptSection() {
  return (
    <section className="mt-5 rounded-lg border border-outline-variant bg-surface-container-lowest p-8">
      <h2 className="text-2xl font-bold leading-snug text-on-surface md:text-3xl">{LCA_INTRO.title}</h2>
      <div className="mt-4 space-y-4">
        {LCA_INTRO.paragraphs.map((t, i) => (
          <p key={i} className="text-[15px] leading-8 text-on-surface-variant">{t}</p>
        ))}
      </div>

      <div className="mt-6">
        <p className="mb-2.5 text-sm font-semibold text-primary">커피의 전과정</p>
        <div className="flex items-stretch gap-2">
          {LIFECYCLE.map((p, i) => (
            <div key={p.name} className="flex flex-1 items-stretch gap-2">
              <div className="flex w-full flex-col items-center rounded-md border border-outline-variant bg-surface-container-low px-2 py-4 text-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {lifecycleIcon(p.icon)}
                </span>
                <p className="mt-2.5 text-sm font-bold text-on-surface">{p.name}</p>
                <p className="mt-1 text-xs leading-snug text-on-surface-variant">{p.desc}</p>
              </div>
              {i < LIFECYCLE.length - 1 && (
                <div className="flex shrink-0 items-center">
                  <ChevronRight className="h-4 w-4 text-outline-variant" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-lg border border-primary/30 bg-primary/5 p-6 sm:flex-row sm:items-center">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <ScanLine className="h-6 w-6" />
        </span>
        <div>
          <p className="text-lg font-bold text-on-surface">이 모든 과정의 데이터를, 고지서 한 장으로.</p>
          <p className="mt-1.5 text-[15px] leading-7 text-on-surface-variant">
            <b className="font-semibold text-primary">MRV 방식</b>은 이퀄테이블만의 <b className="font-semibold text-on-surface">OCR 자동 판독 기술</b>로,
            전기 고지서·거래명세서를 올리기만 하면 산정에 필요한 수치를 스스로 읽어냅니다. 복잡한 전과정 데이터를 손쉽게,
            그러나 <b className="font-semibold text-on-surface">실제 증빙에 근거한 신뢰할 수 있는 값</b>으로 채워 —
            누구나 전문가 수준의 정확한 탄소발자국을 산정할 수 있습니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function lifecycleIcon(icon: LifecyclePhase['icon']) {
  const cls = 'h-5 w-5';
  switch (icon) {
    case 'sprout':
      return <Sprout className={cls} />;
    case 'ship':
      return <Ship className={cls} />;
    case 'flame':
      return <Flame className={cls} />;
    case 'package':
      return <Package className={cls} />;
    case 'truck':
      return <Truck className={cls} />;
    case 'coffee':
      return <Coffee className={cls} />;
    case 'trash':
      return <Trash2 className={cls} />;
  }
}

/* ────────────────── 3가지 축 섹션 ────────────────── */

function AxesSection() {
  return (
    <section className="mt-5">
      <h2 className="text-lg font-bold text-on-surface">시작할 때 정하는 3가지</h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        아래 세 가지를 정하면 나에게 맞는 산정 방식이 결정되고, 진행 단계가 구성됩니다.
      </p>
      <div className="mt-4 space-y-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        {AXES.map((axis) => (
          <div key={axis.num}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {axis.num}
              </span>
              <h3 className="text-base font-bold text-on-surface">{axis.title}</h3>
              <span className="text-xs text-on-surface-variant">— {axis.question}</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {axis.options.map((o) => (
                <div key={o.name} className="rounded-md border border-outline-variant bg-surface-container-low p-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-on-surface">{o.name}</p>
                    {o.tag && <Badge variant={o.tagTone === 'warning' ? 'warning' : 'primary'}>{o.tag}</Badge>}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">{o.desc}</p>
                </div>
              ))}
            </div>
            {axis.note && (
              <p className="mt-2.5 rounded-md bg-surface-container-high px-3 py-2 text-xs text-on-surface-variant">
                ⓘ {axis.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────── 선택기 + 조합 상세 ────────────────── */

function SelectorRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4">
      <span className="w-20 shrink-0 pt-2 text-sm font-semibold text-on-surface">{label}</span>
      <div>{children}</div>
    </div>
  );
}

interface SegOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: SegOption<T>[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-md border border-outline-variant bg-surface-container-low p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded px-3.5 py-1.5 text-sm font-semibold transition',
            o.disabled
              ? 'cursor-not-allowed text-on-surface-variant/40'
              : value === o.value
                ? 'bg-primary text-white'
                : 'text-on-surface-variant hover:bg-surface-container-high',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function groupByPhase(steps: WorkflowStep[]) {
  const groups: { phase: string; steps: WorkflowStep[] }[] = [];
  for (const s of steps) {
    const last = groups[groups.length - 1];
    if (last && last.phase === s.phase) last.steps.push(s);
    else groups.push({ phase: s.phase, steps: [s] });
  }
  return groups;
}

interface WorkflowDetailProps {
  title: string;
  summary: string;
  certify: boolean;
  isMrv: boolean;
  steps: WorkflowStep[];
  onStart: () => void;
}

function WorkflowDetail({ title, summary, certify, isMrv, steps, onStart }: WorkflowDetailProps) {
  const groups = groupByPhase(steps);
  let no = 0;

  return (
    <div className="mt-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-bold text-on-surface">{title}</h3>
        <Badge variant={certify ? 'primary' : 'warning'}>{certify ? '인증 가능' : '참고용'}</Badge>
        <Badge variant="neutral">전체 {steps.length}단계</Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{summary}</p>

      {isMrv && (
        <div className="mt-5">
          <DocumentChecklist />
        </div>
      )}

      <div className="mt-6 space-y-5">
        {groups.map((g) => (
          <div key={g.phase}>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wide text-primary">{g.phase}</h4>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {g.steps.map((s) => {
                no += 1;
                return <StepDetailCard key={s.key} no={no} step={s} />;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center border-t border-outline-variant pt-5">
        <Button onClick={onStart}>
          <Plus className="h-4 w-4" /> 이 방식으로 시작하기
        </Button>
      </div>
    </div>
  );
}

function StepDetailCard({ no, step }: { no: number; step: WorkflowStep }) {
  const c = STEP_INTRO[step.key];
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-low p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
          {no}
        </span>
        <p className="text-sm font-bold text-on-surface">{step.title}</p>
        {step.auto && (
          <Badge variant="neutral">
            <Cpu className="h-3 w-3" /> 자동
          </Badge>
        )}
      </div>
      {c && <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">{c.summary}</p>}
      {c && (
        <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
          <b className="font-semibold text-primary">입력</b> {c.inputs}
        </p>
      )}
    </div>
  );
}

/** MRV 필요 문서 체크리스트 (필수 강조) */
function DocumentChecklist() {
  const required = MRV_DOCUMENTS.filter((d) => d.required);
  const optional = MRV_DOCUMENTS.filter((d) => !d.required);

  return (
    <section className="rounded-lg border border-primary/30 bg-primary/5 p-6">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold text-on-surface">먼저 준비하면 좋은 문서</h3>
      </div>
      <p className="mt-1 text-sm text-on-surface-variant">
        MRV 방식은 아래 문서를 올리면 자동으로 값이 채워집니다. <b className="font-semibold text-primary">필수 2종</b>만 있으면 시작할 수 있어요.
      </p>

      <p className="mb-2 mt-4 text-xs font-semibold text-primary">필수</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {required.map((d) => (
          <li key={d.name} className="flex items-start gap-2 rounded-md border border-outline-variant bg-surface-container-lowest p-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary text-white">
              <Check className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-on-surface">{d.name}</p>
              <p className="text-xs text-on-surface-variant">{d.note}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mb-2 mt-4 text-xs font-semibold text-on-surface-variant">선택 (해당하는 경우에만)</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {optional.map((d) => (
          <li key={d.name} className="rounded-md border border-outline-variant/70 bg-surface-container-lowest p-3">
            <p className="text-sm font-medium text-on-surface">{d.name}</p>
            <p className="text-xs text-on-surface-variant">{d.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
