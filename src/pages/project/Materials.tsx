import { ChevronDown, Plus, X, Check } from 'lucide-react';
import { useState } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import {
  DocPicker,
  FormField,
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
          <FormField label="봉투 1개 포장량" required help="봉투 하나에 담기는 원두 양입니다.">
            <UnitInput unit="g/ea" type="number" placeholder="0" />
          </FormField>
        </div>
        <ReadonlyField label="단위 기간 사용량" value="—" unit="ea" help="생산량과 포장량으로 자동 계산됩니다." />
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
          <ReadonlyField label="단위 기간 박스 사용량" value="—" unit="ea" help="최소포장재 사용량 ÷ 1박스당 제품 개수" />
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
          <FormField label="재질 지정 방식" required help="사전 정의(크라프트지) / 재질 비율 / 공급자 CFP 중 선택합니다.">
            <Select
              options={[
                { value: 'A', label: '사전 정의 (크라프트지)' },
                { value: 'B', label: '재질 비율 직접 입력' },
                { value: 'C', label: '공급자 제공 CFP' },
              ]}
            />
          </FormField>
          <InfoBanner>드립의 경우 원두 14g + 여과지 1.6g 기준으로 사용량이 자동 계산됩니다. (Shadow PEFCR 기준)</InfoBanner>
          <ReadonlyField label="여과지 총 질량" value="—" unit="kg" help="원두 생산량 기준으로 자동 산출됩니다. (수정 불가)" />
        </SectionCard>
      )}

      {/* DB 매핑 확인 */}
      <SectionCard
        title="원료 매칭 확인"
        description="입력한 원료·포장재를 시스템의 물질 데이터베이스에 자동으로 연결했습니다. 잘못된 항목이 있으면 다시 지정하세요."
      >
        <div className="divide-y divide-outline-variant overflow-hidden rounded-md border border-outline-variant">
          {[
            { label: `${farms[0].bean} 생두`, mapped: '커피 생두 (Green coffee)' },
            { label: data.minPackLabel, mapped: '복합 필름 포장재' },
            ...(showBox ? [{ label: '골판지 박스', mapped: '골판지 (Corrugated board)' }] : []),
            ...(showFilter ? [{ label: '크라프트지 여과지', mapped: '크라프트지 (Kraft paper)' }] : []),
          ].map((m) => (
            <div key={m.label} className="flex items-center justify-between bg-surface-container-lowest px-4 py-2.5 text-sm">
              <div>
                <span className="font-medium text-on-surface">{m.label}</span>
                <span className="mx-1.5 text-on-surface-variant">→</span>
                <span className="text-on-surface-variant">{m.mapped}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <Check className="h-3.5 w-3.5" /> 확인됨
              </span>
            </div>
          ))}
        </div>
        <InfoBanner>매칭이 끝나지 않은 항목이 있으면 다음 단계(누적 질량 기여도)로 넘어갈 수 없습니다.</InfoBanner>
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
            <FormField label="농장 탄소배출 증빙문서 (선택)" hint="문서를 선택하거나 [업로드]로 올리면 농장명·주소가 자동으로 채워집니다. 증빙이 있으면 실제 농장 탄소배출량을, 없으면 문헌값을 적용합니다.">
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
                help="증빙 미선택 시 문헌값(Nab & Maslin, 2020) 1.165가 자동 적용됩니다."
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
                help="원두 생산량 × 블렌딩 비율 ÷ 0.7612로 자동 역산됩니다. (수정 불가)"
              />
            </div>
          </div>

          {/* A-2 생두 포장 정보 */}
          <div className="py-6">
            <p className="mb-4 text-lg font-bold text-on-surface">생두 포장 (자루)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="포대 재질" required help="생두 자루 재질을 선택합니다. 황마·PP 복수 선택 가능.">
                <Select options={[{ value: 'jute', label: '황마' }, { value: 'pp', label: 'PP' }, { value: 'both', label: '황마 + PP' }]} />
              </FormField>
              <FormField label="단위 포대 중량" required>
                <UnitInput unit="kg" type="number" defaultValue={farm.sackWeight} />
              </FormField>
              <FormField label="포대 1개 무게" required hint={<OcrBadge text="증빙 사진 자동 추출 · 미업로드 시 기본값" />}>
                <UnitInput unit="g" type="number" defaultValue={farm.sackUnitWeight} />
              </FormField>
              <ReadonlyField label="총 투입 질량" value="—" unit="kg" help="포대 수량 × 1개 무게. 폐기 단계 발생량으로 이어집니다." />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── 재질 지정 방식 (A 사전정의 / B 재질비율 / C 공급자 CFP) ── */
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
      <FormField label="재질 지정 방식" required help="사전 정의 종류 선택 / 재질 비율 직접 입력 / 공급자 제공 CFP 중 선택합니다.">
        <Select
          value={method}
          onChange={(e) => setMethod(e.target.value as 'A' | 'B' | 'C')}
          options={[
            { value: 'A', label: '사전 정의 종류 선택' },
            { value: 'B', label: '재질 비율 직접 입력' },
            { value: 'C', label: '공급자 제공 CFP' },
          ]}
        />
      </FormField>

      {method === 'A' && (
        <FormField label={aLabel} required help="선택 시 배출계수가 자동 적용됩니다.">
          <Select options={aOptions} />
        </FormField>
      )}

      {method === 'B' && (
        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-on-surface">재질 + 비율</p>
            <span className="text-xs text-on-surface-variant">합계 100%</span>
          </div>
          <div className="space-y-2">
            {['재질 1', '재질 2'].map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <TextInput className="flex-1" placeholder={r} />
                <div className="w-28">
                  <UnitInput unit="%" type="number" placeholder="0" />
                </div>
                <button type="button" onClick={() => alert('행 삭제 (목업)')} className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container-high" aria-label="행 삭제">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {method === 'C' && (
        <FormField label="공급자 제공 CFP" required hint={<OcrBadge text="거래명세서에서 자동 추출 (직접 입력 불가)" />}>
          <UnitInput unit="kg CO₂e/kg" type="number" placeholder="0" disabled readOnly />
        </FormField>
      )}
    </div>
  );
}

/* ── 테이프 (재질에 따라 산정 방식 상이) ── */
function TapeFields() {
  const [tape, setTape] = useState<'opp' | 'kraft'>('opp');
  return (
    <div className="space-y-4">
      <FormField label="테이프 재질" required help="OPP는 면적 기준, 크라프트는 무게 기준으로 배출량을 산정합니다.">
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
        help="(4W + 2D) × 박스 사용량으로 자동 산출됩니다. 단위 무게는 제품 스펙 기본값(크라프트 6.5g/m · OPP 3.5g/m)을 적용합니다."
      />
    </div>
  );
}
