import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import {
  FormField,
  InfoBanner,
  OcrBadge,
  RadioGroup,
  ReadonlyField,
  Select,
  TextInput,
} from '@/components/ui/form';

/**
 * ⑥ 제조단계 — MRV 공통 화면.
 *
 * 화면 구성은 방법론(ISO 14067 / 환경성적표지)·시스템 경계(제품 생산까지 / 폐기까지)와
 * 무관하게 완전히 동일하다. 화면 내 분기는 방법론·경계가 아니라
 *   (1) 로스터기 연료 유형(전력 전용 / 전력+가스) → 가스 섹션 표시 여부
 *   (2) 재생에너지 직접 생산 여부(Y/N)          → 재생에너지 하위 항목 표시 여부
 * 두 축에만 의존한다.
 *
 * 배출량(전력·가스)은 이 화면에 표시하지 않고 마지막 결과 단계에서만 산출·표시한다.
 */

interface MrvManufacturingProps {
  /** 기본정보에서 정한 로스터기 연료 유형 (전력+가스일 때만 가스 섹션 노출) */
  fuel?: 'elec' | 'elec_gas';
}

/** 월별 고지서 예시 행 (목업 샘플) */
interface BillRow {
  month: string;
  amount: number;
  provider: string;
}

const POWER_BILLS: BillRow[] = [
  { month: '2026-01', amount: 1240, provider: '한국전력공사' },
  { month: '2026-02', amount: 1185, provider: '한국전력공사' },
];

const GAS_BILLS: BillRow[] = [
  { month: '2026-01', amount: 320, provider: '서울도시가스' },
  { month: '2026-02', amount: 298, provider: '서울도시가스' },
];

const GEN_ROWS: { month: string; amount: number }[] = [
  { month: '2026-01', amount: 210 },
  { month: '2026-02', amount: 240 },
];

export function MrvManufacturing({ fuel = 'elec_gas' }: MrvManufacturingProps = {}) {
  const [renewable, setRenewable] = useState<'y' | 'n'>('n');
  const [gasType, setGasType] = useState<'ng' | 'lpg'>('ng');

  const gasUnitOptions =
    gasType === 'ng'
      ? [
          { value: 'nm3', label: 'Nm³' },
          { value: 'kg', label: 'kg' },
          { value: 'mj', label: 'MJ' },
          { value: 'mcal', label: 'Mcal' },
        ]
      : [
          { value: 'kg', label: 'kg' },
          { value: 'mj', label: 'MJ' },
          { value: 'mcal', label: 'Mcal' },
        ];

  return (
    <div className="space-y-4">
      {/* Section A — 전력 (로스팅) */}
      <SectionCard
        title="1. 전력 (로스팅)"
        description="로스팅에 사용한 전력입니다. 업로드한 전력 고지서에서 사용량을 자동으로 읽어옵니다."
      >
        <InfoBanner>
          전력 고지서에서 사용량을 자동으로 읽어옵니다. 값이 다르면 직접 고칠 수 있고, 수정한 내용은 자동으로 기록됩니다.
          데이터 수집 기간 전체(월별)를 빠짐없이 올려야 합니다.
        </InfoBanner>

        <BillList
          rows={POWER_BILLS}
          amountLabel="전력 사용량"
          unit="kWh"
          addLabel="전력 고지서 추가"
        />

        <ReadonlyField
          label="단위 기간 전력 사용량 합계"
          value="2,425"
          unit="kWh"
          help="올린 고지서의 월별 사용량을 모두 더한 값입니다."
        />
        <p className="text-xs text-on-surface-variant">
          전력 배출량(Scope 2)은 마지막 <b className="font-medium text-on-surface">결과</b> 단계에서 계산되어 표시됩니다.
        </p>
      </SectionCard>

      {/* Section B — 재생에너지 (자가발전) */}
      <SectionCard
        title="2. 재생에너지 (자가발전)"
        description="태양광 등으로 전기를 직접 생산해 사용하는 경우 입력합니다. 외부에서 구매한 재생에너지(녹색프리미엄·REC 등)는 인정되지 않습니다."
      >
        <FormField label="재생에너지를 직접 생산해 사용하나요?" required>
          <RadioGroup
            name="renewable"
            value={renewable}
            onChange={(v) => setRenewable(v as 'y' | 'n')}
            options={[
              { value: 'n', label: '아니요', desc: '자가발전 설비가 없습니다.' },
              { value: 'y', label: '예', desc: '태양광 등으로 직접 생산한 전기를 사용합니다.' },
            ]}
          />
        </FormField>

        {renewable === 'y' && (
          <>
            <InfoBanner>
              자가발전으로 사용한 전력은 배출계수 0으로 처리됩니다. 발전량 모니터링 기록의 기간이 데이터 수집 기간에
              포함되어야 합니다.
            </InfoBanner>

            <FormField
              label="재생에너지 설치 확인서"
              required
              hint="업로드한 문서 중에서 선택합니다."
            >
              <Select
                options={[
                  { value: '', label: '문서 선택' },
                  { value: 'doc1', label: '태양광 설치 확인서.pdf' },
                ]}
              />
            </FormField>

            <div>
              <p className="mb-2 text-sm font-medium text-on-surface">월별 자가발전량</p>
              <div className="space-y-2">
                {GEN_ROWS.map((row, idx) => (
                  <div key={idx} className="rounded-md border border-outline-variant bg-surface-container-low p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <OcrBadge />
                      <DeleteButton />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <FormField label="기록 연월">
                        <TextInput type="month" defaultValue={row.month} />
                      </FormField>
                      <FormField label="자가발전량">
                        <AmountWithUnit defaultValue={row.amount} unit="kWh" />
                      </FormField>
                    </div>
                  </div>
                ))}
              </div>
              <AddButton label="발전량 기록 추가" />
            </div>

            <ReadonlyField label="단위 기간 자가발전량 합계" value="450" unit="kWh" help="증빙 목적으로 월별 발전량을 합산한 값입니다." />
          </>
        )}
      </SectionCard>

      {/* Section C — 가스 (로스팅) : 연료 유형 = 전력+가스 시만 표시 */}
      {fuel === 'elec_gas' && (
        <SectionCard
          title="3. 가스 (로스팅)"
          description="가스 로스터기를 함께 사용하는 경우 가스 사용량을 입력합니다."
        >
          <InfoBanner>
            이 항목은 기본정보에서 로스터기 연료 유형을 ‘전기 + 가스’로 선택한 경우에만 나타납니다. 가스 고지서에서 사용량을
            자동으로 읽어옵니다.
          </InfoBanner>

          <FormField
            label="가스 종류"
            required
            help="가스 종류에 따라 사용량 단위 선택지가 달라집니다."
          >
            <Select
              value={gasType}
              onChange={(e) => setGasType(e.target.value as 'ng' | 'lpg')}
              options={[
                { value: 'ng', label: '천연가스 (도시가스)' },
                { value: 'lpg', label: 'LPG' },
              ]}
            />
          </FormField>

          <BillList
            rows={GAS_BILLS}
            amountLabel="가스 사용량"
            unitOptions={gasUnitOptions}
            addLabel="가스 고지서 추가"
          />

          <p className="text-xs text-on-surface-variant">
            가스 배출량(Scope 1)은 마지막 <b className="font-medium text-on-surface">결과</b> 단계에서 계산되어 표시됩니다.
          </p>
        </SectionCard>
      )}

      {/* Section D — 채프 발생량 (자동) */}
      <SectionCard
        title={`${fuel === 'elec_gas' ? '4' : '3'}. 커피 껍질(채프) 발생량`}
        description="로스팅 중 떨어져 나오는 얇은 껍질입니다. 따로 입력할 필요 없이 자동으로 계산됩니다."
      >
        <ReadonlyField
          label="채프 발생량"
          value="—"
          unit="kg"
          help="생두 투입량 × 0.0057 (생두 1kg당 5.7g)으로 자동 산정됩니다."
        />
        <InfoBanner>
          채프 발생량은 품종별 실측값(Bytof et al., 2024)에 세계 생산·수출 비중을 가중한 생두 1kg당 5.7g을 적용해 자동
          계산됩니다. 이 값은 폐기 단계 발생량으로 자동 이어집니다.
        </InfoBanner>
      </SectionCard>
    </div>
  );
}

/* ── 내부 재사용 요소 ─────────────────────────────── */

/** 월별 고지서 목록 (전력·가스 공통). 사용량 단위는 고정(unit) 또는 선택(unitOptions). */
function BillList({
  rows,
  amountLabel,
  unit,
  unitOptions,
  addLabel,
}: {
  rows: BillRow[];
  amountLabel: string;
  unit?: string;
  unitOptions?: { value: string; label: string }[];
  addLabel: string;
}) {
  return (
    <div>
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="rounded-md border border-outline-variant bg-surface-container-low p-3">
            <div className="mb-2 flex items-center justify-between">
              <OcrBadge />
              <DeleteButton />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <FormField label="발행 연월">
                <TextInput type="month" defaultValue={row.month} />
              </FormField>
              <FormField label={amountLabel}>
                <AmountWithUnit defaultValue={row.amount} unit={unit} unitOptions={unitOptions} />
              </FormField>
              <FormField label="발급처">
                <TextInput defaultValue={row.provider} />
              </FormField>
            </div>
          </div>
        ))}
      </div>
      <AddButton label={addLabel} />
    </div>
  );
}

/** 숫자 입력 + 단위(고정 텍스트 또는 선택 드롭다운) */
function AmountWithUnit({
  defaultValue,
  unit,
  unitOptions,
}: {
  defaultValue: number;
  unit?: string;
  unitOptions?: { value: string; label: string }[];
}) {
  return (
    <div className="flex gap-2">
      <TextInput type="number" defaultValue={defaultValue} className="flex-1" />
      {unitOptions ? (
        <Select options={unitOptions} className="w-24 shrink-0" />
      ) : (
        <span className="flex shrink-0 items-center px-1 text-sm text-on-surface-variant">{unit}</span>
      )}
    </div>
  );
}

function AddButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => alert(`${label} (목업)`)}
      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}

function DeleteButton() {
  return (
    <button
      type="button"
      className="rounded-md p-1 text-on-surface-variant hover:bg-surface-container-high"
      aria-label="삭제"
      onClick={() => alert('삭제 (목업)')}
    >
      <X className="h-4 w-4" />
    </button>
  );
}
