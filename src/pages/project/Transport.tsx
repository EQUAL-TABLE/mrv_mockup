import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import { DocPicker, FormField, InfoBanner, OcrBadge, ReadonlyField, Select, TextInput, UnitInput } from '@/components/ui/form';
import type { Boundary, Methodology } from '@/types/project';
import { DEFAULT_PROJECT_DATA } from '@/data/projectData';
import type { ProjectData } from '@/data/projectData';

/**
 * ④ 제조전단계-수송 — MRV 공통(방법론·경계 분기).
 *
 * 탭1 생두 수송(수출국 내륙 → 국제 → 수입국 내륙), 탭2 부자재 수송.
 * 조합별 부자재 수송:
 *   - 최소포장재: 항상
 *   - 출하포장재(E): 환경성적표지 · 폐기까지 전용
 *   - 여과지(F): ISO 14067 · 폐기까지(드립) 전용
 * 국제·국내 수송 EF는 방법론별로 자동 적용된다. 배출량은 결과 단계에서만 산출.
 */

interface Props {
  methodology?: Methodology;
  boundary?: Boundary;
  data?: ProjectData;
}

export function Transport({ methodology = 'iso', boundary = 'grave', data = DEFAULT_PROJECT_DATA }: Props = {}) {
  const [tab, setTab] = useState<'green' | 'sub'>('green');
  const [open, setOpen] = useState<number[]>([0]);
  const toggle = (i: number) => setOpen((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  const farms = data.farms;
  const grave = boundary === 'grave';
  const showBox = methodology === 'epd' && grave;
  const showFilter = methodology === 'iso' && grave;

  return (
    <div className="space-y-4">
      <InfoBanner>
        생두가 <b className="font-medium text-on-surface">농장에서 로스터리까지</b> 오는 이동 과정과, 포장재가 공급처에서
        오는 이동 과정을 등록합니다. 거리는 대부분 자동으로 계산되며, 자동 산출이 안 되면 직접 입력합니다.
      </InfoBanner>

      {/* 탭 */}
      <div className="flex gap-1 rounded-md border border-outline-variant bg-surface-container-low p-1">
        <TabButton active={tab === 'green'} onClick={() => setTab('green')}>
          생두 수송
        </TabButton>
        <TabButton active={tab === 'sub'} onClick={() => setTab('sub')}>
          부자재 수송
        </TabButton>
      </div>

      {tab === 'green' && (
        <div className="space-y-2">
          {farms.map((farm, i) => (
            <GreenTransportSet key={i} farm={farm} open={open.includes(i)} onToggle={() => toggle(i)} />
          ))}
        </div>
      )}

      {tab === 'sub' && (
        <>
          <InfoBanner>
            수송 배출계수는 {methodology === 'epd' ? '환경성적표지 전용 EF' : 'ISO 14067 기준 EF(국제 구간 DEFRA 등)'}가 자동으로
            적용됩니다.
          </InfoBanner>
          <SubTransport title="최소포장재 수송" doc="최소포장재 구매 거래명세서" />
          {showBox && <SubTransport title="출하포장재 수송 (환경성적표지 전용)" doc="출하포장재 구매 거래명세서" />}
          {showFilter && <SubTransport title="여과지 수송 (드립 전용)" doc="부자재 구매 거래명세서" />}
        </>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded px-3 py-2 text-sm font-semibold transition ${
        active ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
      }`}
    >
      {children}
    </button>
  );
}

/* ── 생두 수송 세트 (농장별 B-1/B-2/B-3) ── */
function GreenTransportSet({
  farm,
  open,
  onToggle,
}: {
  farm: { name: string; country: string };
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-surface-container-high/40">
        <span className="flex items-center gap-2">
          <span className="text-sm font-bold text-on-surface">{farm.name}</span>
          <span className="text-xs text-on-surface-variant">{farm.country} → 로스터리</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-on-surface-variant transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-outline-variant px-6 py-5">
          <Leg
            title="수출국 내륙 수송"
            desc="농장 → 수출항"
            from={{ label: '출발지', value: `${farm.country} 농장 주소`, auto: true }}
            to={{ label: '도착지', value: '수출항 (자동 연결)', auto: true }}
            transports={[{ value: 'truck', label: '트럭' }, { value: 'train', label: '기차' }]}
          />
          <Leg
            title="국제 수송"
            desc="수출항 → 수입항"
            docLabel="B/L 또는 항공화물운송장"
            from={{ label: '출발항', value: '', auto: false, ocr: true }}
            to={{ label: '도착항', value: '', auto: false, ocr: true }}
            transports={[{ value: 'ship', label: '선박' }, { value: 'air', label: '항공' }]}
          />
          <Leg
            title="수입국 내륙 수송"
            desc="수입항 → 로스터리"
            docLabel="수입국 내륙수송 거래명세서"
            from={{ label: '출발지', value: '', auto: false, ocr: true }}
            to={{ label: '도착지', value: '로스터리 주소 (자동 연결)', auto: true }}
            transports={[{ value: 'truck', label: '트럭' }, { value: 'train', label: '기차' }]}
          />
        </div>
      )}
    </section>
  );
}

interface Endpoint {
  label: string;
  value: string;
  auto: boolean;
  ocr?: boolean;
}

function Leg({
  title,
  desc,
  docLabel,
  from,
  to,
  transports,
}: {
  title: string;
  desc: string;
  docLabel?: string;
  from: Endpoint;
  to: Endpoint;
  transports: { value: string; label: string }[];
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <p className="text-sm font-semibold text-on-surface">{title}</p>
        <span className="text-xs text-on-surface-variant">{desc}</span>
      </div>

      {docLabel && (
        <div className="mb-3">
          <FormField label="증빙문서 (선택)" hint="선택하거나 [업로드]로 새 문서를 올리면 출발·도착지와 수송량이 자동으로 채워집니다.">
            <DocPicker placeholder={`${docLabel} 선택`} />
          </FormField>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <EndpointField field={from} />
        <EndpointField field={to} />
        <FormField label="수송수단" required>
          <Select options={transports} />
        </FormField>
        <FormField label="수송 거리" required hint="자동 산출되며, 안 되면 직접 입력하세요.">
          <UnitInput unit="km" type="number" placeholder="자동 계산" />
        </FormField>
      </div>
      <div className="mt-3">
        <ReadonlyField label="수송량" value="—" unit="ton" help="생두 투입량이 자동으로 연결됩니다." />
      </div>
    </div>
  );
}

function EndpointField({ field }: { field: Endpoint }) {
  return (
    <FormField label={field.label} hint={field.ocr ? <OcrBadge /> : field.auto ? '자동 연결' : undefined}>
      <TextInput defaultValue={field.value} placeholder={field.ocr ? '문서에서 자동 추출' : ''} disabled={field.auto} readOnly={field.auto} />
    </FormField>
  );
}

/* ── 부자재 수송 (공급처 → 로스터리) ── */
function SubTransport({ title, doc }: { title: string; doc: string }) {
  return (
    <SectionCard title={title} description="공급처에서 로스터리까지의 이동입니다. 수송수단은 트럭으로 고정됩니다.">
      <FormField label="구매 거래명세서 (선택)" hint="선택하거나 [업로드]로 새 명세서를 올리면 공급처 주소가 자동으로 채워집니다.">
        <DocPicker placeholder={`${doc} 선택`} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="공급처 주소" required>
          <TextInput placeholder="예: 경기도 파주시 …" />
        </FormField>
        <ReadonlyField label="수송수단" value="트럭 (고정)" />
        <FormField label="수송 거리" required hint="공급처·로스터리 주소로 자동 산출됩니다.">
          <UnitInput unit="km" type="number" placeholder="자동 계산" />
        </FormField>
        <ReadonlyField label="수송량" value="—" unit="kg" help="해당 부자재 총 사용 중량이 자동으로 연결됩니다." />
      </div>
    </SectionCard>
  );
}
