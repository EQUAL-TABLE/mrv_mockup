import { CalendarClock, Megaphone, Tag, X } from 'lucide-react';
import { useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { VersionMeta } from '@/data/admin';
import { FormField, TextInput, Textarea } from '@/components/ui/form';

// ── 페이지 헤더 ───────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-on-surface">{title}</h1>
        {description && <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── 카드 컨테이너 ─────────────────────────────────────────
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-lg border border-outline-variant bg-surface-container-lowest', className)}>{children}</div>
  );
}

export function CardTitle({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-outline-variant px-5 py-3.5">
      <div>
        <h3 className="text-sm font-bold text-on-surface">{title}</h3>
        {sub && <p className="mt-0.5 text-xs text-on-surface-variant">{sub}</p>}
      </div>
      {actions}
    </div>
  );
}

// ── 통계 타일 (대시보드/모니터링) ─────────────────────────
interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: string;
  Icon?: ComponentType<{ className?: string }>;
  tone?: 'default' | 'ok' | 'warn' | 'error';
}

const STAT_TONE: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-on-surface',
  ok: 'text-primary',
  warn: 'text-warning',
  error: 'text-error',
};

export function StatCard({ label, value, sub, Icon, tone = 'default' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-on-surface-variant">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-on-surface-variant" />}
      </div>
      <p className={cn('mt-2 text-2xl font-bold tracking-tight', STAT_TONE[tone])}>{value}</p>
      {sub && <p className="mt-1 text-xs text-on-surface-variant">{sub}</p>}
    </div>
  );
}

// ── 탭 ────────────────────────────────────────────────────
export interface TabItem {
  key: string;
  label: string;
}

export function Tabs({ items, value, onChange }: { items: TabItem[]; value: string; onChange: (key: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-outline-variant">
      {items.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface',
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ── 테이블 ────────────────────────────────────────────────
export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  rowKey: (row: T) => string;
}

export function DataTable<T>({ columns, rows, onRowClick, empty, rowKey }: DataTableProps<T>) {
  const alignClass = (a?: 'left' | 'right' | 'center') =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  if (rows.length === 0 && empty) {
    return <div className="px-5 py-16">{empty}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low/60">
            {columns.map((c, i) => (
              <th
                key={i}
                className={cn('whitespace-nowrap px-4 py-3 text-xs font-semibold text-on-surface-variant', alignClass(c.align))}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-outline-variant/60 last:border-0',
                onRowClick && 'cursor-pointer transition hover:bg-surface-container-low/60',
              )}
            >
              {columns.map((c, i) => (
                <td key={i} className={cn('px-4 py-3 text-on-surface', alignClass(c.align), c.className)}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 상태 배지 (활성/정지/대기 등) ─────────────────────────
type PillTone = 'green' | 'gray' | 'amber' | 'red';
const PILL_TONE: Record<PillTone, string> = {
  green: 'border-primary/40 bg-primary/5 text-primary',
  gray: 'border-outline-variant bg-surface-container-low text-on-surface-variant',
  amber: 'border-warning/40 bg-warning/5 text-warning',
  red: 'border-error/40 bg-error/5 text-error',
};

export function Pill({ tone = 'gray', children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold', PILL_TONE[tone])}>
      {children}
    </span>
  );
}

// ── 빈 상태 ───────────────────────────────────────────────
export function EmptyState({ Icon, title, description }: { Icon: ComponentType<{ className?: string }>; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low">
        <Icon className="h-5 w-5 text-on-surface-variant" />
      </span>
      <p className="text-sm font-semibold text-on-surface">{title}</p>
      {description && <p className="text-xs text-on-surface-variant">{description}</p>}
    </div>
  );
}

// ── 필터 바 ───────────────────────────────────────────────
export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-2">{children}</div>;
}

// ── 모달 ──────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, footer, wide }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest shadow-xl',
          wide ? 'max-w-2xl' : 'max-w-md',
        )}
      >
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-3.5">
          <h3 className="text-sm font-bold text-on-surface">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-on-surface-variant transition hover:bg-surface-container-high">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-outline-variant px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

// ── 정의형(라벨-값) 표시 ──────────────────────────────────
export function DefRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 py-2.5 text-sm">
      <span className="w-32 shrink-0 text-on-surface-variant">{label}</span>
      <span className="min-w-0 flex-1 font-medium text-on-surface">{children}</span>
    </div>
  );
}

// ── 버전/매칭 메타 배지 (공존 레코드의 차이를 한눈에) ──────
/** 적용연도·공고일·데이터버전을 컬러 칩으로 표시. 자동 매칭이 참고하는 메타를 강조 노출 */
export function MetaBadges({ meta, latest }: { meta?: VersionMeta; latest?: boolean }) {
  if (!meta) return <span className="text-xs text-on-surface-variant">—</span>;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {latest && (
        <span className="inline-flex items-center rounded bg-primary px-1.5 py-0.5 text-[11px] font-bold text-white">최신</span>
      )}
      {meta.effectiveYear && (
        <span className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/5 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
          <CalendarClock className="h-3 w-3" />
          적용 {meta.effectiveYear}
        </span>
      )}
      {meta.dataVersion && (
        <span className="inline-flex items-center gap-1 rounded border border-outline-variant bg-surface-container-low px-1.5 py-0.5 text-[11px] font-medium text-on-surface-variant">
          <Tag className="h-3 w-3" />
          {meta.dataVersion}
        </span>
      )}
      {meta.announcedAt && (
        <span className="inline-flex items-center gap-1 rounded border border-outline-variant bg-surface-container-low px-1.5 py-0.5 text-[11px] font-medium text-on-surface-variant">
          <Megaphone className="h-3 w-3" />
          공고 {meta.announcedAt}
        </span>
      )}
    </div>
  );
}

// ── 공용 토스트 ───────────────────────────────────────────
export function useFlash() {
  const [msg, setMsg] = useState<string | null>(null);
  const flash = (m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 3000);
  };
  return { msg, flash };
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[min(90vw,36rem)] -translate-x-1/2 rounded-md bg-on-surface px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
      {msg}
    </div>
  );
}

/** 등록/새버전 폼의 매칭 메타 입력 필드 (모두 선택 — 파악 가능한 만큼만 입력) */
export function MetaFields({
  meta,
  onChange,
}: {
  meta: VersionMeta;
  onChange: (patch: Partial<VersionMeta>) => void;
}) {
  return (
    <div className="rounded-md border border-outline-variant p-4">
      <p className="text-sm font-bold text-on-surface">버전 · 매칭 메타데이터</p>
      <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
        프로젝트 연도·사용자 입력값 기반 자동 매칭이 참고합니다. 모두 선택 입력이며, EF에 등록·공고·적용연도가 명시되지
        않은 경우가 많으니 파악 가능한 만큼만 입력하세요.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <FormField label="적용(기준) 연도" help="매칭 1순위 기준. 미상이면 비워둡니다.">
          <TextInput value={meta.effectiveYear ?? ''} onChange={(e) => onChange({ effectiveYear: e.target.value })} placeholder="예: 2026" />
        </FormField>
        <FormField label="공고일(발표일)">
          <TextInput value={meta.announcedAt ?? ''} onChange={(e) => onChange({ announcedAt: e.target.value })} placeholder="예: 2026-08" />
        </FormField>
        <FormField label="데이터 버전" help="관리자 자유 입력. 출처 판(버전)·개정 이력 등.">
          <TextInput value={meta.dataVersion ?? ''} onChange={(e) => onChange({ dataVersion: e.target.value })} placeholder="예: EG-TIPS 2026" />
        </FormField>
      </div>
      <FormField label="매칭 판단 근거" className="mt-3" help="시스템 경계·공정 흐름 등 종합 검토 메모. 매칭 로직/검토자가 참고.">
        <Textarea rows={2} value={meta.matchNote ?? ''} onChange={(e) => onChange({ matchNote: e.target.value })} placeholder="예: 계통전력 생산 경계 · 2026년 프로젝트 대상" />
      </FormField>
    </div>
  );
}
