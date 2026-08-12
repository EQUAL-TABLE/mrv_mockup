import { Check, HelpCircle, Info, Loader2, ScanLine, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
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

/**
 * 문서 선택 + 인라인 업로드.
 * 각 단계에서 이미 올린 증빙을 고르거나, 여기서 바로 새 증빙을 업로드할 수 있게 한다.
 * 목업: 실제 파일 선택 다이얼로그를 띄우고, 선택하면 OCR "처리중 → 완료"를 시뮬레이션한다.
 */
export function DocPicker({
  options = [],
  placeholder = '문서 선택',
  uploadLabel = '업로드',
  className,
}: {
  /** 이미 업로드된 문서 중 선택 목록 */
  options?: Option[];
  placeholder?: string;
  uploadLabel?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [docs, setDocs] = useState<Option[]>(options);
  const [value, setValue] = useState(options[0]?.value ?? '');
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 같은 파일 재선택 허용
    if (!file) return;
    const val = `upload_${docs.length + 1}`;
    setDocs((d) => [...d, { value: val, label: file.name }]);
    setValue(val);
    setStatus('processing');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus('done'), 1200);
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Select
          className="flex-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          options={[{ value: '', label: placeholder }, ...docs]}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-high"
        >
          <Upload className="h-4 w-4" /> {uploadLabel}
        </button>
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
      </div>
      {status !== 'idle' && (
        <p
          className={cn(
            'mt-1.5 inline-flex items-center gap-1 text-xs font-semibold',
            status === 'done' ? 'text-primary' : 'text-on-surface-variant',
          )}
        >
          {status === 'processing' ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> 업로드한 문서 OCR 처리중…
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" /> OCR 완료 · 값이 자동으로 채워졌습니다
            </>
          )}
        </p>
      )}
    </div>
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
