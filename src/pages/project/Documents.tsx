import { Check, FileText, Loader2, Upload, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { SectionCard } from '@/components/workspace/SectionCard';
import { InfoBanner } from '@/components/ui/form';
import type { Boundary, Methodology, ProjectStatus } from '@/types/project';

/**
 * ② OCR 문서 업로드 — MRV 공통(방법론·경계 분기).
 *
 * 15종 문서 중 조합별 조건부 노출:
 *   - #7 출하포장재: 환경성적표지 · 폐기까지 전용
 *   - #8 여과지: ISO 14067 · 폐기까지(드립) 전용
 *   - #14 납품 / #15 재활용 증빙: 폐기까지 전용
 * (드립 시나리오는 폐기까지 프로젝트에서 선택된 것으로 가정)
 */

interface Props {
  methodology?: Methodology;
  boundary?: Boundary;
  status?: ProjectStatus;
}

export type OcrState = 'done' | 'processing' | 'failed' | 'empty';

interface DocItem {
  no: number;
  name: string;
  required: boolean;
  state: OcrState;
  files?: string;
  cond?: string;
  show?: boolean;
}

export function Documents({ methodology = 'iso', boundary = 'grave', status = 'draft' }: Props = {}) {
  const grave = boundary === 'grave';
  const epd = methodology === 'epd';
  const isoGrave = methodology === 'iso' && grave; // 여과지(드립) 노출 조건
  // 진행 상태가 검토/완료면 업로드가 마무리된 것으로 간주 (필수·기존 업로드 문서는 OCR 완료 처리)
  const advanced = status === 'review' || status === 'finalized' || status === 'done';
  const stateFor = (d: DocItem): OcrState => (advanced && (d.required || d.state !== 'empty') ? 'done' : d.state);

  const rawGroups: { step: string; docs: DocItem[] }[] = [
    {
      step: '원부자재',
      docs: [
        { no: 1, name: '생두 INVOICE', required: true, state: 'done', files: '2개' },
        { no: 2, name: '농장 탄소배출 증빙문서', required: false, state: 'empty' },
        { no: 9, name: '생두 포대 무게 증빙 사진', required: false, state: 'empty' },
      ],
    },
    {
      step: '원료 수송',
      docs: [
        { no: 3, name: 'B/L 또는 항공화물운송장', required: false, state: 'done', files: '1개' },
        { no: 4, name: '수출국 내륙수송 거래명세서', required: false, state: 'empty' },
        { no: 5, name: '수입국 내륙수송 거래명세서', required: false, state: 'processing', files: '1개' },
        { no: 6, name: '최소포장재 구매 거래명세서', required: false, state: 'empty' },
        { no: 7, name: '출하포장재 구매 거래명세서', required: false, state: 'empty', cond: '환경성적표지 전용', show: epd && grave },
        { no: 8, name: '부자재 구매 거래명세서 (여과지)', required: false, state: 'empty', cond: '드립 · 폐기까지 전용', show: isoGrave },
      ],
    },
    {
      step: '제조',
      docs: [
        { no: 10, name: '전력 고지서', required: true, state: 'done', files: '12개 (월별)' },
        { no: 11, name: '가스 고지서', required: false, state: 'done', files: '12개 (월별)', cond: '전기+가스 선택 시' },
        { no: 12, name: '재생에너지 설치 확인서', required: false, state: 'empty' },
        { no: 13, name: '재생에너지 발전량 모니터링 기록', required: false, state: 'empty' },
      ],
    },
    {
      step: '제품 유통 · 폐기',
      docs: [
        { no: 14, name: '납품 거래명세서', required: false, state: 'empty', cond: '폐기까지 전용', show: grave },
        { no: 15, name: '재활용폐기물처리 증빙서류', required: false, state: 'empty', cond: '폐기까지 전용', show: grave },
      ],
    },
  ];
  const groups = rawGroups
    .map((g) => ({ ...g, docs: g.docs.filter((d) => d.show !== false) }))
    .filter((g) => g.docs.length > 0);

  return (
    <div className="space-y-4">
      <InfoBanner>
        전기 고지서·거래명세서 등 보유한 증빙을 올리면 시스템이 자동으로 값을 읽어 다음 단계 입력 칸을 채워줍니다.
        <b className="font-medium text-on-surface"> 생두 INVOICE와 전력 고지서 2종만 있어도 시작</b>할 수 있고, 나머지는 각
        단계에서 추가로 올릴 수 있습니다. (확정 전까지 언제든 교체·삭제 가능)
      </InfoBanner>

      {groups.map((g) => (
        <SectionCard key={g.step} title={g.step} description={`${g.step} 단계에서 사용되는 증빙 문서입니다.`}>
          <div className="divide-y divide-outline-variant overflow-hidden rounded-md border border-outline-variant">
            {g.docs.map((d) => (
              <DocRow key={d.no} doc={{ ...d, state: stateFor(d) }} />
            ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function DocRow({ doc }: { doc: DocItem }) {
  return (
    <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-3">
      <FileText className="h-4 w-4 shrink-0 text-on-surface-variant" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium text-on-surface">{doc.name}</span>
          {doc.required ? <Badge variant="primary">필수</Badge> : <Badge variant="neutral">선택</Badge>}
          {doc.cond && <Badge variant="neutral">{doc.cond}</Badge>}
        </div>
        {doc.files && <p className="mt-0.5 text-xs text-on-surface-variant">업로드됨 · {doc.files}</p>}
      </div>
      <OcrStatus state={doc.state} />
    </div>
  );
}

function OcrStatus({ state }: { state: OcrState }) {
  if (state === 'empty') {
    return (
      <button
        type="button"
        onClick={() => alert('파일 업로드 (목업)')}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-outline-variant px-2.5 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container-high"
      >
        <Upload className="h-3.5 w-3.5" /> 업로드
      </button>
    );
  }
  const map = {
    done: { icon: Check, label: 'OCR 완료', cls: 'text-primary' },
    processing: { icon: Loader2, label: 'OCR 처리중', cls: 'text-on-surface-variant' },
    failed: { icon: AlertCircle, label: 'OCR 실패', cls: 'text-error' },
  } as const;
  const { icon: Icon, label, cls } = map[state];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold ${cls}`}>
      <Icon className={`h-3.5 w-3.5 ${state === 'processing' ? 'animate-spin' : ''}`} /> {label}
    </span>
  );
}
