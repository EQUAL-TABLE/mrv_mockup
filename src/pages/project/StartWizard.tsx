import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calculator,
  Check,
  FileCheck2,
  Factory,
  Globe2,
  Lock,
  Recycle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppShell } from '@/components/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  BOUNDARY_OPTIONS,
  METHODOLOGY_OPTIONS,
  TRACK_OPTIONS,
  type WizardIcon,
  type WizardOption,
} from '@/data/startWizard';
import { WORKFLOW_META, getSteps, resolveWorkflowId } from '@/data/workflow';
import { BOUNDARY_LABEL, METHODOLOGY_LABEL, TRACK_LABEL } from '@/types/project';
import type { Boundary, Methodology, Track } from '@/types/project';

/**
 * 신규 프로젝트 시작 위저드 (/start).
 * [+ 탄소발자국 산정] 진입 시, 산정 방식 → 방법론 → 산정 범위를 순서대로 선택한다.
 * - 계산기 트랙: 방법론 단계를 건너뜀 (방법론 선택 없음)
 * - 환경성적표지: 산정 범위가 ‘폐기까지’로 고정 (제품 생산까지 선택 불가)
 * 서비스 안내에서 3가지를 이미 확인한 경우에는 이 화면을 거치지 않고 기본정보로 바로 진입한다.
 */

type StepKey = 'track' | 'methodology' | 'boundary';

const STEP_META: Record<StepKey, { nav: string; title: string; intro: string }> = {
  track: {
    nav: '산정 방식',
    title: '산정 방식 선택',
    intro:
      '산정 방식(트랙)은 탄소배출량을 ‘어떻게’ 계산할지 정하는 첫 선택입니다. 실제 증빙 문서를 근거로 정확하게 산정할지, 값을 직접 입력해 간편하게 추정할지를 고릅니다. 이 선택에 따라 이후 입력 방식과 인증 가능 여부가 달라집니다.',
  },
  methodology: {
    nav: '방법론',
    title: '방법론 선택',
    intro:
      '방법론(표준)은 산정 결과가 ‘어떤 기준’을 따를지 정합니다. 국제 표준 ISO 14067과 국내 환경성적표지 중 탄소발자국 기준 중 목표에 맞는 표준을 선택하세요. 표준에 따라 포함되는 단계와 배출계수 규칙이 달라집니다.',
  },
  boundary: {
    nav: '산정 범위',
    title: '산정 범위 선택',
    intro:
      '산정 범위(시스템 경계)는 커피의 전과정 중 ‘어디까지’ 계산에 포함할지 정합니다. 제품이 공장을 나서기 직전까지만 볼지, 소비자 사용·폐기까지 볼지를 선택하세요.',
  },
};

/** 전체(개념) 스텝 표시 순서 */
const ALL_STEP_KEYS: StepKey[] = ['track', 'methodology', 'boundary'];

export function StartWizard() {
  const navigate = useNavigate();
  const [track, setTrack] = useState<Track>('mrv');
  const [methodology, setMethodology] = useState<Methodology>('iso');
  const [boundary, setBoundary] = useState<Boundary>('grave');
  const [stepIndex, setStepIndex] = useState(0);

  // 계산기 트랙은 방법론 단계를 건너뛴다 (방법론 선택 없음)
  const activeSteps: StepKey[] = track === 'calculator' ? ['track', 'boundary'] : ['track', 'methodology', 'boundary'];
  const clamped = Math.min(stepIndex, activeSteps.length - 1);
  const currentKey = activeSteps[clamped];
  const isFirst = clamped === 0;
  const isLast = clamped === activeSteps.length - 1;

  const onTrack = (t: Track) => {
    setTrack(t);
    if (t === 'calculator') setMethodology('iso');
  };
  const onMethodology = (m: Methodology) => {
    setMethodology(m);
    if (m === 'epd') setBoundary('grave');
  };

  const goNext = () => {
    if (isLast) {
      navigate(`/projects/new/basic?track=${track}&methodology=${methodology}&boundary=${boundary}`);
      return;
    }
    setStepIndex(clamped + 1);
  };
  const goPrev = () => setStepIndex(Math.max(0, clamped - 1));

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        {/* 헤더 + 닫기 */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">새 탄소발자국 산정</p>
            <h1 className="mt-1 text-2xl font-bold text-on-surface">{STEP_META[currentKey].title}</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
          >
            <X className="h-4 w-4" /> 나가기
          </button>
        </div>

        {/* 스텝 인디케이터 */}
        <StepIndicator activeKey={currentKey} track={track} />

        {/* 단계 설명 */}
        <p className="mt-6 text-[15px] leading-7 text-on-surface-variant">{STEP_META[currentKey].intro}</p>

        {/* 좌/우 선택 카드 */}
        <div className="mt-6">
          {currentKey === 'track' && (
            <OptionGrid>
              {TRACK_OPTIONS.map((o) => (
                <OptionCard key={o.value} opt={o} selected={track === o.value} onSelect={() => onTrack(o.value)} />
              ))}
            </OptionGrid>
          )}

          {currentKey === 'methodology' && (
            <OptionGrid>
              {METHODOLOGY_OPTIONS.map((o) => (
                <OptionCard
                  key={o.value}
                  opt={o}
                  selected={methodology === o.value}
                  onSelect={() => onMethodology(o.value)}
                />
              ))}
            </OptionGrid>
          )}

          {currentKey === 'boundary' && (
            <OptionGrid>
              {BOUNDARY_OPTIONS.map((o) => {
                const lockedByEpd = methodology === 'epd' && o.value === 'gate';
                return (
                  <OptionCard
                    key={o.value}
                    opt={o}
                    selected={boundary === o.value && !lockedByEpd}
                    disabled={lockedByEpd}
                    lockNote={lockedByEpd ? '환경성적표지는 산정 범위가 ‘폐기까지’로 고정되어 선택할 수 없습니다.' : undefined}
                    onSelect={() => setBoundary(o.value)}
                  />
                );
              })}
            </OptionGrid>
          )}
        </div>

        {/* 계산기 트랙 안내 (방법론 건너뜀) */}
        {currentKey === 'track' && track === 'calculator' && (
          <p className="mt-3 flex items-center gap-1.5 rounded-md bg-surface-container-high px-3 py-2 text-xs text-on-surface-variant">
            <Lock className="h-3.5 w-3.5" /> 계산기 트랙은 방법론 선택 없이 다음 단계에서 산정 범위만 선택합니다.
          </p>
        )}

        {/* 마지막 단계: 선택 조합 요약 */}
        {isLast && <ChoiceSummary track={track} methodology={methodology} boundary={boundary} />}

        {/* 하단 네비게이션 */}
        <div className="mt-8 flex items-center justify-between border-t border-outline-variant pt-5">
          {isFirst ? (
            <Button variant="ghost" onClick={() => navigate('/')}>
              취소
            </Button>
          ) : (
            <Button variant="secondary" onClick={goPrev}>
              <ArrowLeft className="h-4 w-4" /> 이전
            </Button>
          )}
          <Button onClick={goNext}>
            {isLast ? (
              <>
                이 방식으로 시작하기 <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                다음 <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

/* ────────────────── 스텝 인디케이터 ────────────────── */

function StepIndicator({ activeKey, track }: { activeKey: StepKey; track: Track }) {
  const activeOrder = track === 'calculator' ? ['track', 'boundary'] : ['track', 'methodology', 'boundary'];
  const activeIndex = activeOrder.indexOf(activeKey);

  return (
    <div className="mt-5 flex items-center">
      {ALL_STEP_KEYS.map((key, i) => {
        const skipped = key === 'methodology' && track === 'calculator';
        const pos = activeOrder.indexOf(key);
        const done = !skipped && pos > -1 && pos < activeIndex;
        const active = key === activeKey;
        return (
          <div key={key} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition',
                  active
                    ? 'bg-primary text-white'
                    : done
                      ? 'bg-primary/15 text-primary'
                      : 'bg-surface-container-high text-on-surface-variant',
                  skipped && 'opacity-50',
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <div className="leading-tight">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    active ? 'text-on-surface' : 'text-on-surface-variant',
                    skipped && 'opacity-50',
                  )}
                >
                  {STEP_META[key].nav}
                </span>
                {skipped && <p className="text-[11px] text-on-surface-variant">선택 안 함</p>}
              </div>
            </div>
            {i < ALL_STEP_KEYS.length - 1 && (
              <span className={cn('mx-3 h-px flex-1', done ? 'bg-primary/40' : 'bg-outline-variant')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────── 선택 카드 ────────────────── */

function OptionGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

interface OptionCardProps<T extends string> {
  opt: WizardOption<T>;
  selected: boolean;
  disabled?: boolean;
  lockNote?: string;
  onSelect: () => void;
}

function OptionCard<T extends string>({ opt, selected, disabled, lockNote, onSelect }: OptionCardProps<T>) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'group relative flex h-full flex-col rounded-xl border-2 p-6 text-left transition',
        disabled
          ? 'cursor-not-allowed border-outline-variant/60 bg-surface-container-low/40'
          : selected
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'border-outline-variant bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low',
      )}
    >
      {/* 선택 체크 */}
      {selected && !disabled && (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
      {disabled && (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
          <Lock className="h-3.5 w-3.5" />
        </span>
      )}

      {/* 아이콘 */}
      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-xl transition',
          disabled ? 'bg-surface-container-high text-on-surface-variant' : selected ? 'bg-primary text-white' : 'bg-primary/10 text-primary',
        )}
      >
        {wizardIcon(opt.icon)}
      </span>

      {/* 제목 · 태그 · 부제 */}
      <div className={cn('mt-4', disabled && 'opacity-60')}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold text-on-surface">{opt.title}</h3>
          {opt.tag && <Badge variant={opt.tagTone === 'warning' ? 'warning' : 'primary'}>{opt.tag}</Badge>}
        </div>
        <p className="mt-0.5 text-sm font-medium text-primary">{opt.subtitle}</p>
      </div>

      {/* 설명 */}
      <p className={cn('mt-3 text-sm leading-relaxed text-on-surface-variant', disabled && 'opacity-60')}>{opt.desc}</p>

      {/* 핵심 특징 */}
      <ul className={cn('mt-4 space-y-1.5', disabled && 'opacity-60')}>
        {opt.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-on-surface">
            <Check className={cn('mt-0.5 h-4 w-4 shrink-0', disabled ? 'text-on-surface-variant' : 'text-primary')} />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {lockNote && (
        <p className="mt-4 flex items-start gap-1.5 rounded-md bg-surface-container-high px-3 py-2 text-xs text-on-surface-variant">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {lockNote}
        </p>
      )}
    </button>
  );
}

function wizardIcon(icon: WizardIcon) {
  const cls = 'h-7 w-7';
  switch (icon) {
    case 'mrv':
      return <FileCheck2 className={cls} />;
    case 'calculator':
      return <Calculator className={cls} />;
    case 'iso':
      return <Globe2 className={cls} />;
    case 'epd':
      return <Award className={cls} />;
    case 'gate':
      return <Factory className={cls} />;
    case 'grave':
      return <Recycle className={cls} />;
  }
}

/* ────────────────── 선택 조합 요약 (마지막 단계) ────────────────── */

function ChoiceSummary({ track, methodology, boundary }: { track: Track; methodology: Methodology; boundary: Boundary }) {
  const workflowId = resolveWorkflowId(track, methodology, boundary);
  const meta = WORKFLOW_META[workflowId];
  const steps = getSteps(workflowId);

  const chips = [
    { label: '산정 방식', value: TRACK_LABEL[track] },
    ...(track === 'calculator' ? [] : [{ label: '방법론', value: METHODOLOGY_LABEL[methodology] }]),
    { label: '산정 범위', value: BOUNDARY_LABEL[boundary] },
  ];

  return (
    <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold text-on-surface">선택한 산정 방식</h3>
        <Badge variant={meta.certify ? 'primary' : 'warning'}>{meta.certify ? '인증 가능' : '참고용'}</Badge>
        <Badge variant="neutral">전체 {steps.length}단계</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((c) => (
          <span
            key={c.label}
            className="inline-flex items-center gap-1.5 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm"
          >
            <span className="text-on-surface-variant">{c.label}</span>
            <span className="font-semibold text-on-surface">{c.value}</span>
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{meta.summary}</p>
    </div>
  );
}
