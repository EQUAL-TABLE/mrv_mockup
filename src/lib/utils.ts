import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 기존 repo와 동일한 className 병합 헬퍼 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
