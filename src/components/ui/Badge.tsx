import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'neutral' | 'primary' | 'warning' | 'solid';

// 신뢰도 톤: 각진(rounded 4px) 헤어라인 태그. 큰 파스텔 알약 지양.
const VARIANT_CLASS: Record<BadgeVariant, string> = {
  neutral: 'border border-outline-variant bg-surface-container-low text-on-surface-variant',
  primary: 'border border-primary/40 bg-primary/5 text-primary',
  warning: 'border border-warning/40 bg-warning/5 text-warning',
  solid: 'bg-primary text-white',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  /** 네이티브 툴팁 (배지 의미 보충 설명) */
  title?: string;
}

/** 재사용 태그/배지 (트랙·방법론·경계·문서 표시 공통) */
export function Badge({ children, variant = 'neutral', className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium',
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

type StatusTone = 'neutral' | 'warning' | 'primary';

// 상태 표시: 색상으로 채운 배지 (가시성 강조)
const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  neutral: 'bg-primary text-white', // 작성중 (초록)
  warning: 'bg-warning text-white', // 검토중 (앰버)
  primary: 'bg-surface-container-high text-on-surface-variant', // 완료 (회색)
};

export function StatusChip({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center rounded px-2 py-0.5 text-xs font-semibold', STATUS_TONE_CLASS[tone])}>
      {label}
    </span>
  );
}
