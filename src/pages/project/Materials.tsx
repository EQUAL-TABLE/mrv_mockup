import { ChevronDown, Plus, X, Check, AlertTriangle, Search } from 'lucide-react';
import { useState } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import {
  DocPicker,
  FormField,
  HelpOptions,
  InfoBanner,
  OcrBadge,
  ReadonlyField,
  Select,
  TextInput,
  UnitInput,
} from '@/components/ui/form';
import type { Boundary, Methodology } from '@/types/project';
import { DEFAULT_PROJECT_DATA } from '@/data/projectData';
import type { FarmData, ProjectData } from '@/data/projectData';

/**
 * ③ 제조전단계-원부자재 — MRV 공통(방법론·경계 분기).
 *
 * 조합별 조건부 섹션:
 *   - Section E(출하포장재: 박스·테이프): 환경성적표지 · 폐기까지 전용
 *   - Section F(여과지): ISO 14067 · 폐기까지(드립) 전용
 * 블렌딩 Y이면 농장 N개가 아코디언으로 생성되고, 각 농장 하위에 생두 정보가 귀속된다.
 */

interface Props {
  methodology?: Methodology;
  boundary?: Boundary;
  data?: ProjectData;
}

export function Materials({ methodology = 'iso', boundary = 'grave', data = DEFAULT_PROJECT_DATA }: Props = {}) {
  const [open, setOpen] = useState<number[]>([0]);
  const toggle = (i: number) => setOpen((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  const farms = data.farms;
  const grave = boundary === 'grave';
  const showBox = methodology === 'epd' && grave; // 출하포장재
  const showFilter = methodology === 'iso' && grave; // 여과지(드립 가정)
  let n = 2; // 1=생두, 2=최소포장재 이후 동적 번호

  return (
    <div className="space-y-4">
      {/* Section A — 생두 (농장별) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-on-surface">1. 생두 (농장 {farms.length}개)</h3>
          <button
            type="button"
            onClick={() => alert('농장 추가 (목업)')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <Plus className="h-4 w-4" /> 농장 추가
          </button>
        </div>
        {farms.map((farm, i) => (
          <FarmBlock key={i} farm={farm} open={open.includes(i)} onToggle={() => toggle(i)} />
        ))}
      </div>

      {/* Section D — 최소포장재 */}
      <SectionCard title="2. 최소포장재" description="원두를 담는 봉투 등 포장재입니다. 여러 종류를 등록할 수 있습니다.">
        <MaterialMethod
          aOptions={[
            { value: 'al', label: '알루미늄 증착 포장재' },
            { value: 'tri', label: '삼중 증착 포장재' },
            { value: 'kraft', label: '크라프트 증착 포장재' },
          ]}
          nameField
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="봉투 1개 무게" required>
            <UnitInput unit="g" type="number" placeholder="0" />
          </FormField>
          <FormField label="봉투 1개 포장량" required helpWide help="봉투 하나에 담는 원두 양입니다. 예를 들어 250g 봉투면 250을 넣으세요. 이 값으로 필요한 봉투 개수를 자동 계산합니다.">
            <UnitInput unit="g/ea" type="number" placeholder="0" />
          </FormField>
        </div>
        <ReadonlyField label="단위 기간 사용량" value="—" unit="ea" help="전체 생산량을 봉투 1개 포장량으로 나눠, 기간 동안 쓴 봉투 개수를 자동 계산한 값입니다." />
        <button
          type="button"
          onClick={() => alert('최소포장재 추가 (목업)')}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <Plus className="h-4 w-4" /> 포장재 추가
        </button>
      </SectionCard>

      {/* Section E — 출하포장재 (환경성적표지 전용) */}
      {showBox && (
      <SectionCard
        title={`${++n}. 출하포장재 (환경성적표지 전용)`}
        description="박스·테이프 등 출하 시 사용하는 포장재입니다. 입력은 선택 사항이며, 없으면 ‘해당 없음’으로 처리됩니다."
      >
        {/* E-1 박스 */}
        <div className="rounded-md border border-outline-variant bg-surface-container-low p-4">
          <p className="mb-3 text-sm font-semibold text-on-surface">박스</p>
          <MaterialMethod aLabel="골판지" aOptions={[{ value: 'corrugated', label: '골판지' }]} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="박스 단위 무게" required>
              <UnitInput unit="g" type="number" placeholder="0" />
            </FormField>
            <FormField label="1박스당 출하 제품 개수" required>
              <UnitInput unit="ea/box" type="number" placeholder="0" />
            </FormField>
          </div>
          <ReadonlyField label="단위 기간 박스 사용량" value="—" unit="ea" help="전체 봉투(최소포장재) 개수를 박스 1개에 담는 제품 개수로 나눠, 필요한 박스 수를 자동 계산합니다." />
        </div>

        {/* E-2 테이프 */}
        <div className="rounded-md border border-outline-variant bg-surface-container-low p-4">
          <p className="mb-3 text-sm font-semibold text-on-surface">테이프</p>
          <TapeFields />
        </div>
      </SectionCard>
      )}

      {/* Section F — 여과지 (ISO 드립 · 폐기까지 전용) */}
      {showFilter && (
        <SectionCard
          title={`${++n}. 여과지 (드립 전용)`}
          description="드립 방식일 때 사용하는 여과지입니다. 사용량은 생산량 기준으로 자동 계산됩니다."
        >
          <FilterMethod />
          <ReadonlyField
            label="여과지 총 질량"
            value="—"
            unit="kg"
            help="드립 커피는 보통 원두 14g마다 여과지 약 1.6g을 씁니다. 이 비율과 전체 생산량으로 여과지 총 무게를 자동 계산합니다. (직접 수정 불가)"
          />
        </SectionCard>
      )}

      {/* DB 매핑 확인 */}
      <SectionCard
        title="원료 매칭 확인"
        description="입력한 원료·포장재를 시스템의 물질 데이터베이스에 자동으로 연결합니다. 자동 매칭에 실패했거나 잘못 연결된 항목은 직접 물질을 지정하세요."
      >
        <MappingReview
          items={[
            { label: `${farms[0].bean} 생두`, auto: '커피 생두 (Green coffee)' },
            { label: data.minPackLabel, auto: '복합 필름 포장재 (Multilayer film)' },
            ...(showBox ? [{ label: '골판지 박스', auto: '골판지 (Corrugated board)' }] : []),
            ...(showFilter ? [{ label: '크라프트지 여과지', auto: '크라프트지 (Kraft paper)' }] : []),
          ]}
        />
      </SectionCard>
    </div>
  );
}

/* ── 농장 블록 (A-1 농장 + A-2 포장 + A-3 생두 기본정보) ── */
function FarmBlock({
  farm,
  open,
  onToggle,
}: {
  farm: FarmData;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-surface-container-high/40"
      >
        <span className="flex items-center gap-2">
          <span className="text-xl font-bold text-on-surface">{farm.name}</span>
          <span className="text-sm text-on-surface-variant">
            {farm.country} · {farm.bean} · 블렌딩 {farm.ratio}%
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-on-surface-variant transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="divide-y divide-outline-variant border-t border-outline-variant px-6">
          {/* A-1 농장 정보 */}
          <div className="py-6">
            <p className="mb-4 text-lg font-bold text-on-surface">농장 정보</p>
            <FormField label="농장 탄소배출 증빙문서 (선택)" 
            help="문서를 선택하거나 [업로드]로 올리면 농장명·주소가 자동으로 입력됩니다. 증빙이 있으면 실제 농장 탄소배출량을, 없으면 문헌값을 적용합니다.">
              <DocPicker placeholder="문서 선택 (미선택 시 문헌값 적용)" />
            </FormField>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="농장명" hint={<OcrBadge />}>
                <TextInput defaultValue={farm.name} />
              </FormField>
              <FormField label="농장 주소" required hint={<OcrBadge />}>
                <TextInput defaultValue={`${farm.country} 일대`} />
              </FormField>
            </div>
            <div className="mt-3">
              <ReadonlyField
                label="생두 단위 탄소배출량"
                value={farm.beanEmission.toFixed(3)}
                unit="kg CO₂e/kg"
                help="증빙 서류를 업로드 하지 않으면, 연구 문헌(Nab & Maslin, 2020)의 표준값 1.165 kg CO₂e/kg(생두)이 자동으로 적용됩니다. "
              />
            </div>
          </div>

          {/* A-3 생두 기본정보 */}
          <div className="py-6">
            <p className="mb-4 text-lg font-bold text-on-surface">생두 기본정보</p>
            <FormField label="생두 INVOICE" required hint="업로드한 문서에서 선택하거나, 오른쪽 [업로드]로 새 INVOICE를 바로 올릴 수 있습니다.">
              <DocPicker placeholder="INVOICE 선택" options={[{ value: 'inv1', label: `INVOICE_${farm.bean}.pdf` }]} />
            </FormField>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <FormField label="생두명" required hint={<OcrBadge />}>
                <TextInput defaultValue={farm.bean} />
              </FormField>
              <FormField label="생산국" required hint={<OcrBadge />}>
                <TextInput defaultValue={farm.country} />
              </FormField>
              <FormField label="거래량 (구매량)" required hint={<OcrBadge />}>
                <UnitInput unit="kg" type="number" placeholder="0" />
              </FormField>
            </div>
            <div className="mt-3">
              <ReadonlyField
                label="생두 투입량"
                value="—"
                unit="kg"
                help="로스팅하면 무게가 줄기 때문에, 원두 생산량에서 거꾸로 계산해 필요한 생두 양을 구합니다. (블렌딩 비율 반영, 로스팅 후 무게 76.12% 기준. 직접 수정 불가)"
              />
            </div>
          </div>

          {/* A-2 생두 포장 정보 */}
          <div className="py-6">
            <p className="mb-4 text-lg font-bold text-on-surface">생두 포장 (자루)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="포대 재질"
                required
                helpWide
                help={
                  <HelpOptions
                    intro="생두가 담겨 온 자루(포대)의 재질을 고릅니다. INVOICE나 자루 표기를 보면 알 수 있어요."
                    items={[
                      { term: '황마', desc: '갈색 마대 자루로, 천 같은 느낌입니다.' },
                      { term: 'PP', desc: '하얗고 매끈한 비닐(플라스틱) 자루입니다.' },
                      { term: '황마 + PP', desc: '두 가지를 함께 쓰는 경우 고릅니다.' },
                    ]}
                  />
                }
              >
                <Select options={[{ value: 'jute', label: '황마' }, { value: 'pp', label: 'PP' }, { value: 'both', label: '황마 + PP' }]} />
              </FormField>
              <FormField label="단위 포대 중량" required>
                <UnitInput unit="kg" type="number" defaultValue={farm.sackWeight} />
              </FormField>
              <FormField label="포대 1개 무게" required hint={<OcrBadge text="증빙 사진 자동 추출 · 미업로드 시 기본값" />}>
                <UnitInput unit="g" type="number" defaultValue={farm.sackUnitWeight} />
              </FormField>
              <ReadonlyField label="총 투입 질량" value="—" unit="kg" help="포대 개수 × 포대 1개 무게로 계산한 생두 자루 전체 무게입니다. 이 값은 나중에 폐기 단계에서 버려지는 포장재 양으로 이어집니다." />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── 포장재 재질 지정 (A 일반 포장재 / B 재질·비율 직접입력 / C 공급자 CFP) ── */

/** 재질·비율 직접 입력에서 고를 수 있는 포장재 재질 목록 */
const PACK_MATERIAL_OPTIONS = [
  { value: '', label: '재질 선택' },
  { value: 'pe', label: 'PE (폴리에틸렌)' },
  { value: 'pp', label: 'PP (폴리프로필렌)' },
  { value: 'pet', label: 'PET (폴리에스터)' },
  { value: 'ldpe', label: 'LDPE (저밀도 폴리에틸렌)' },
  { value: 'alu', label: '알루미늄 (증착/호일)' },
  { value: 'kraft', label: '크라프트지' },
  { value: 'paper', label: '종이' },
  { value: 'nylon', label: '나일론 (PA)' },
  { value: 'evoh', label: 'EVOH' },
];

/** 3가지 재질 지정 방식에 대한 상세 설명 (툴팁) */
const METHOD_HELP = (
  <div className="space-y-2.5">
    <div>
      <p className="font-semibold text-on-surface">① 일반적인 포장재 선택</p>
      <p>
        커피 포장에 흔히 쓰이는 포장재(알루미늄 증착·삼중 증착·크라프트 증착 등)를 목록에서 고르면 해당
        포장재의 배출계수가 자동 적용됩니다. 재질 구성을 정확히 모를 때 가장 간편한 방식입니다.
      </p>
    </div>
    <div>
      <p className="font-semibold text-on-surface">② 포장재 구성 재질, 비율 직접 입력</p>
      <p>
        포장재를 이루는 재질(PE·크라프트 등)과 각 재질의 구성 비율(%)을 직접 입력합니다. 포장재의 재질 구성
        비율을 알고 있는 경우 사용하세요. 비율 합계는 100%가 되어야 합니다.
      </p>
    </div>
    <div>
      <p className="font-semibold text-on-surface">③ 포장재 생산자가 직접 제공한 탄소발자국</p>
      <p>
        포장재 생산자(공급자)가 산정해 제공한 탄소발자국(CFP) 값을 그대로 사용합니다. 공급자의 CFP 증명
        자료가 있을 때만 선택할 수 있습니다.
      </p>
    </div>
  </div>
);

function MaterialMethod({
  aOptions,
  aLabel = '포장재 종류',
  nameField = false,
}: {
  aOptions: { value: string; label: string }[];
  aLabel?: string;
  nameField?: boolean;
}) {
  const [method, setMethod] = useState<'A' | 'B' | 'C'>('A');
  return (
    <div className="space-y-4">
      {nameField && (
        <FormField label="포장재명" required>
          <TextInput placeholder="예: 250g 원두 봉투" />
        </FormField>
      )}
      <FormField
        label="포장재 재질 지정"
        required
        help={METHOD_HELP}
        helpWide
      >
        <Select
          value={method}
          onChange={(e) => setMethod(e.target.value as 'A' | 'B' | 'C')}
          options={[
            { value: 'A', label: '일반적인 포장재 선택' },
            { value: 'B', label: '포장재 구성 재질, 비율 직접 입력' },
            { value: 'C', label: '포장재 생산자가 직접 제공한 탄소발자국' },
          ]}
        />
      </FormField>

      {method === 'A' && (
        <FormField label={aLabel} required helpWide help="목록에서 재질을 고르면, 그 재질을 만들 때 나오는 탄소량(배출계수)이 시스템에 미리 저장된 값으로 자동 적용됩니다. 따로 숫자를 넣지 않아도 돼요.">
          <Select options={aOptions} />
        </FormField>
      )}

      {method === 'B' && (
        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-on-surface">포장재 구성 재질, 비율 직접 입력</p>
            <span className="text-xs text-on-surface-variant">합계 100%</span>
          </div>
          <div className="space-y-2">
            {['재질 1', '재질 2'].map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select className="flex-1" options={PACK_MATERIAL_OPTIONS} aria-label={r} />
                <div className="w-28">
                  <UnitInput unit="%" type="number" placeholder="0" />
                </div>
                <button type="button" onClick={() => alert('행 삭제 (목업)')} className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container-high" aria-label="행 삭제">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => alert('재질 추가 (목업)')}
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <Plus className="h-4 w-4" /> 재질 추가
          </button>
        </div>
      )}

      {method === 'C' && (
        <div className="space-y-4">
          <FormField
            label="탄소발자국 증명 자료"
            required
            hint="공급자가 제공한 CFP 증빙(성적서·시험성적표 등)을 업로드하세요."
          >
            <DocPicker placeholder="증명 자료 선택" uploadLabel="업로드" />
          </FormField>
          <FormField
            label="포장재 생산자가 직접 제공한 탄소발자국"
            required
            hint={<OcrBadge text="증명 자료에서 자동 추출 (직접 입력 불가)" />}
          >
            <UnitInput unit="kg CO₂e/kg" type="number" placeholder="0" disabled readOnly />
          </FormField>
        </div>
      )}
    </div>
  );
}

/* ── 원료 매칭 (자동 매핑 + 실패 시 수동 매핑) ── */

/** 수동 매핑 시 검색 대상이 되는 물질 데이터베이스 후보 */
const DB_MATERIALS = [
  { id: 'green', name: '커피 생두 (Green coffee)', note: '농산물 · 생두' },
  { id: 'film', name: '복합 필름 포장재 (Multilayer film)', note: '플라스틱 · 복합필름' },
  { id: 'kraft', name: '크라프트지 (Kraft paper)', note: '종이 · 크라프트' },
  { id: 'corrugated', name: '골판지 (Corrugated board)', note: '종이 · 골판지' },
  { id: 'alu', name: '알루미늄 호일 (Aluminium foil)', note: '금속 · 알루미늄' },
  { id: 'ldpe', name: 'PE 필름 (LDPE)', note: '플라스틱 · 폴리에틸렌' },
  { id: 'pp', name: 'PP 필름 (Polypropylene)', note: '플라스틱 · 폴리프로필렌' },
  { id: 'pet', name: 'PET 필름 (Polyester)', note: '플라스틱 · 폴리에스터' },
  { id: 'paper', name: '종이 (Paper)', note: '종이 · 일반' },
  { id: 'nylon', name: '나일론 필름 (PA)', note: '플라스틱 · 나일론' },
];

interface MapItem {
  /** 입력한 원료·포장재명 */
  label: string;
  /** 자동 매칭된 DB 물질명 (null이면 자동 매칭 실패 → 수동 매핑 필요) */
  auto: string | null;
}

function MappingReview({ items }: { items: MapItem[] }) {
  // 각 항목의 현재 매핑값 (null = 미매칭)
  const [mapped, setMapped] = useState<(string | null)[]>(() => items.map((it) => it.auto));
  // 검색 패널이 열린 행 index (미매칭 항목이 있으면 첫 번째를 기본으로 연다)
  const [editing, setEditing] = useState<number | null>(() => {
    const first = items.findIndex((it) => it.auto === null);
    return first === -1 ? null : first;
  });
  const [query, setQuery] = useState('');

  const unresolved = mapped.filter((m) => m === null).length;
  const q = query.trim().toLowerCase();
  const filtered = q ? DB_MATERIALS.filter((m) => m.name.toLowerCase().includes(q) || m.note.toLowerCase().includes(q)) : DB_MATERIALS;

  const openEdit = (i: number) => {
    setEditing(i);
    setQuery('');
  };
  const pick = (i: number, name: string) => {
    setMapped((prev) => prev.map((m, idx) => (idx === i ? name : m)));
    setEditing(null);
    setQuery('');
  };

  return (
    <>
      <div className="divide-y divide-outline-variant overflow-hidden rounded-md border border-outline-variant">
        {items.map((it, i) => {
          const value = mapped[i];
          const isEditing = editing === i;
          return (
            <div key={it.label} className="bg-surface-container-lowest">
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <div className="min-w-0">
                  <span className="font-medium text-on-surface">{it.label}</span>
                  <span className="mx-1.5 text-on-surface-variant">→</span>
                  {value ? (
                    <span className="text-on-surface-variant">{value}</span>
                  ) : (
                    <span className="font-medium text-warning">물질을 지정해 주세요</span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {value ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      <Check className="h-3.5 w-3.5" /> 확인됨
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
                      <AlertTriangle className="h-3.5 w-3.5" /> 매칭 필요
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => (isEditing ? setEditing(null) : openEdit(i))}
                    className="rounded-md border border-outline-variant px-2 py-1 text-xs font-medium text-on-surface transition hover:bg-surface-container-high"
                  >
                    {isEditing ? '닫기' : value ? '다시 지정' : '물질 지정'}
                  </button>
                </div>
              </div>

              {isEditing && (
                <div className="border-t border-outline-variant bg-surface-container-low px-4 py-3">
                  <div className="relative mb-2">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                    <TextInput
                      className="pl-8"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="물질 데이터베이스 검색 (예: 크라프트, 필름, 알루미늄)"
                    />
                  </div>
                  <div className="max-h-56 divide-y divide-outline-variant overflow-auto rounded-md border border-outline-variant bg-surface-container-lowest">
                    {filtered.length === 0 ? (
                      <p className="px-3 py-4 text-center text-xs text-on-surface-variant">검색 결과가 없습니다.</p>
                    ) : (
                      filtered.map((m) => {
                        const selected = value === m.name;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => pick(i, m.name)}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-surface-container-high"
                          >
                            <span className="flex items-center gap-1.5 text-on-surface">
                              {selected && <Check className="h-3.5 w-3.5 text-primary" />}
                              {m.name}
                            </span>
                            <span className="shrink-0 text-xs text-on-surface-variant">{m.note}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {unresolved > 0 ? (
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning-container/60 p-3 text-sm leading-relaxed text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            자동 매칭되지 않은 항목이 <b>{unresolved}건</b> 있습니다. 각 항목의 [물질 지정]에서 데이터베이스 물질을 직접 선택해
            주세요. 매칭되지 않은 항목이 남아 있으면 다음 단계(누적 질량 기여도)로 넘어갈 수 없습니다.
          </span>
        </div>
      ) : (
        <InfoBanner>모든 항목이 물질 데이터베이스에 연결되었습니다. 잘못 연결된 항목이 있으면 [다시 지정]으로 바꿀 수 있습니다.</InfoBanner>
      )}
    </>
  );
}

/* ── 여과지 재질 선택 (A 일반 여과지 / C 생산자 제공 탄소발자국) ── */
function FilterMethod() {
  const [method, setMethod] = useState<'A' | 'C'>('A');
  return (
    <div className="space-y-4">
      <FormField
        label="여과지 재질 선택"
        required
        helpWide
        help={
          <HelpOptions
            intro="여과지의 탄소량을 어떻게 정할지 고릅니다."
            items={[
              { term: '일반 여과지', desc: '표준값(크라프트지 기준)을 자동으로 적용합니다. 대부분 이걸 고르면 됩니다.' },
              {
                term: '여과지 생산자가 직접 제공한 탄소발자국',
                desc: '여과지 만든 회사가 준 공식 탄소발자국(CFP) 자료가 있을 때, 그 값을 그대로 씁니다.',
              },
            ]}
          />
        }
      >
        <Select
          value={method}
          onChange={(e) => setMethod(e.target.value as 'A' | 'C')}
          options={[
            { value: 'A', label: '일반 여과지' },
            { value: 'C', label: '여과지 생산자가 직접 제공한 탄소발자국' },
          ]}
        />
      </FormField>

      {method === 'A' && (
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-warning">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          환경성적표지 평가계수의 크라프트지 탄소배출량이 적용됩니다.
        </p>
      )}

      {method === 'C' && (
        <div className="space-y-4">
          <FormField
            label="탄소발자국 증명 자료"
            required
            hint="여과지 생산자가 제공한 CFP 증빙(성적서·시험성적표 등)을 업로드하세요."
          >
            <DocPicker placeholder="증명 자료 선택" uploadLabel="업로드" />
          </FormField>
          <FormField
            label="여과지 생산자가 직접 제공한 탄소발자국"
            required
            hint={<OcrBadge text="증명 자료에서 자동 추출 (직접 입력 불가)" />}
          >
            <UnitInput unit="kg CO₂e/kg" type="number" placeholder="0" disabled readOnly />
          </FormField>
        </div>
      )}
    </div>
  );
}

/* ── 테이프 (재질에 따라 산정 방식 상이) ── */
function TapeFields() {
  const [tape, setTape] = useState<'opp' | 'kraft'>('opp');
  return (
    <div className="space-y-4">
      <FormField
        label="테이프 재질"
        required
        helpWide
        help={
          <HelpOptions
            intro="박스를 봉하는 테이프의 재질을 고릅니다."
            items={[
              { term: 'OPP 투명 테이프', desc: '흔히 쓰는 투명 비닐 테이프입니다. 사용한 면적으로 배출량을 계산합니다.' },
              { term: '크라프트 종이 테이프', desc: '물이나 접착제로 붙이는 갈색 종이 테이프입니다. 무게로 배출량을 계산합니다.' },
            ]}
          />
        }
      >
        <Select
          value={tape}
          onChange={(e) => setTape(e.target.value as 'opp' | 'kraft')}
          options={[
            { value: 'opp', label: 'OPP 투명 테이프' },
            { value: 'kraft', label: '크라프트 종이 테이프' },
          ]}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="박스 가로(W)" required>
          <UnitInput unit="mm" type="number" placeholder="0" />
        </FormField>
        <FormField label="박스 세로(D)" required>
          <UnitInput unit="mm" type="number" placeholder="0" />
        </FormField>
        <FormField label="박스 높이(H)" required>
          <UnitInput unit="mm" type="number" placeholder="0" />
        </FormField>
      </div>
      <ReadonlyField
        label="단위 기간 테이프 사용량"
        value="—"
        unit="m"
        help="박스 하나를 봉하는 데 드는 테이프 길이(가로 4번 + 세로 2번)에 박스 개수를 곱해 자동 계산합니다. 테이프 무게는 표준값(크라프트 6.5g/m · OPP 3.5g/m)을 적용합니다."
      />
    </div>
  );
}
