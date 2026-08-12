import { HelpCircle, Info, ScanLine } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** 폼 컨트롤 공통 클래스 (신뢰도 톤: rounded-md, 헤어라인 보더) */
const CONTROL =
  'w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface ' +
  'placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ' +
  'disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-on-surface-variant';

/** 도움말 툴팁 (쉬운 설명 제공) */
export function HelpTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <HelpCircle className="h-3.5 w-3.5 cursor-help text-on-surface-variant" />
      <span className="pointer-events-none absolute left-1/2 top-5 z-20 hidden w-60 -translate-x-1/2 rounded-md border border-outline-variant bg-surface-container-lowest p-2.5 text-xs font-normal leading-relaxed text-on-surface-variant shadow-md group-hover:block">
        {text}
      </span>
    </span>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  help?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** 라벨 + (도움말) + 컨트롤 + 힌트 */
export function FormField({ label, required, help, hint, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center gap-1">
        <span className="text-sm font-medium text-on-surface">
          {label}
          {required && <span className="text-error"> *</span>}
        </span>
        {help && <HelpTip text={help} />}
      </div>
      {children}
      {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

/** 단위 접미사가 붙는 숫자 입력 */
export function UnitInput({ unit, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { unit: string }) {
  return (
    <div className="relative">
      <input className={cn(CONTROL, 'pr-14', className)} {...props} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">{unit}</span>
    </div>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, 'resize-none', className)} {...props} />;
}

interface Option {
  value: string;
  label: string;
}

export function Select({ options, className, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { options: Option[] }) {
  return (
    <select className={cn(CONTROL, 'appearance-none bg-[length:1rem] pr-8', className)} {...props}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

interface RadioGroupProps {
  name: string;
  value: string;
  options: (Option & { desc?: string })[];
  onChange: (value: string) => void;
}

/** 자동 계산·고정 값 표시 (읽기전용) */
export function ReadonlyField({ label, help, value, unit }: { label: string; help?: string; value: ReactNode; unit?: string }) {
  return (
    <FormField label={label} help={help}>
      <div className="flex items-center justify-between rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 text-sm">
        <span className="font-medium text-on-surface">{value}</span>
        {unit && <span className="text-on-surface-variant">{unit}</span>}
      </div>
    </FormField>
  );
}

/** OCR 자동 추출값 표시 배지 (업로드 문서에서 자동으로 읽어온 값) */
export function OcrBadge({ text = '문서 자동 추출' }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
      <ScanLine className="h-3 w-3" /> {text}
    </span>
  );
}

/** 안내 배너 (자동 계산·조건 안내 등) */
export function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-outline-variant bg-surface-container-low p-3 text-sm leading-relaxed text-on-surface-variant">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>{children}</div>
    </div>
  );
}

/** 라디오 그룹 (카드형 선택) */
export function RadioGroup({ name, value, options, onChange }: RadioGroupProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              'flex cursor-pointer items-start gap-2.5 rounded-md border p-3 transition',
              active ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-container-high',
            )}
          >
            <input
              type="radio"
              name={name}
              checked={active}
              onChange={() => onChange(o.value)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span>
              <span className="block text-sm font-medium text-on-surface">{o.label}</span>
              {o.desc && <span className="mt-0.5 block text-xs text-on-surface-variant">{o.desc}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
