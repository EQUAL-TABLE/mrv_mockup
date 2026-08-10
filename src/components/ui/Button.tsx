import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  // 신뢰도 톤: 단색(그라데이션 없음)
  primary: 'bg-primary text-white hover:bg-primary-container',
  secondary: 'border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-high',
  ghost: 'text-on-surface-variant hover:bg-surface-container-high',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** 공통 버튼 (radius 6px, 단색) */
export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    />
  );
}
