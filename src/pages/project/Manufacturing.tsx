import { AlertTriangle, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import {
  DocPicker,
  FormField,
  HelpOptions,
  InfoBanner,
  RadioGroup,
  ReadonlyField,
  Select,
  SourceBadge,
  TextInput,
} from '@/components/ui/form';
import { DEFAULT_PROJECT_DATA } from '@/data/projectData';
import type { ProjectData } from '@/data/projectData';

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
  data?: ProjectData;
}

/** 월별 고지서 예시 행 (목업 샘플) */
interface BillRow {
  month: string;
  amount: number;
  provider: string;
}

const numberFmt = (n: number) => n.toLocaleString('en-US');

export function MrvManufacturing({ data = DEFAULT_PROJECT_DATA }: MrvManufacturingProps = {}) {
  const fuel = data.production.fuel;
  const [renewable, setRenewable] = useState<'y' | 'n'>(data.renewable ? 'y' : 'n');
  const [gasType, setGasType] = useState<'ng' | 'lpg'>(data.gasType);

  const powerSum = data.powerBills.reduce((s, b) => s + b.amount, 0);
  const genSum = data.genRows.reduce((s, g) => s + g.amount, 0);

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
        description="로스팅에 사용한 전력입니다. 업로드한 전력 고지서에서 사용량을 자동으로 읽어옵니다. 값이 다르면 직접 수정할 수 있습니다. 반드시 데이터 수집 기간 전체(월별)를 빠짐없이 올려야 합니다."
      >
    
        <BillList
          rows={data.powerBills}
          amountLabel="전력 사용량"
          unit="kWh"
          addLabel="전력 고지서 추가"
          docLabel="전력 고지서"
        />

        <ReadonlyField
          label="단위 기간 전력 사용량 합계"
          value={numberFmt(powerSum)}
          unit="kWh"
          source="calculated"
          help="올린 전력 고지서의 월별 사용량을 모두 더한 값입니다. 이 전기를 쓰며 나온 배출량은 결과 단계에서 계산돼요."
        />
        <p className="text-xs text-on-surface-variant">
          전력 배출량(Scope 2)은 마지막 <b className="font-medium text-on-surface">결과</b> 단계에서 계산되어 표시됩니다.
        </p>
      </SectionCard>

      {/* Section B — 재생에너지 (자가발전) */}
      <SectionCard
        title="2. 재생에너지 (자가발전)"
        description="태양광 등으로 전기를 직접 생산해 사용하는 경우 입력합니다. 외부에서 구매한 재생에너지(녹색프리미엄·REC 등)는 인정되지 않습니다. 자가발전으로 사용한 전력은 배출계수 0으로 처리됩니다. 발전량 모니터링 기록의 기간이 데이터 수집 기간에 포함되어야 합니다."
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
            <FormField
              label="재생에너지 설치 확인서"
              required
              hint="업로드한 문서 중에서 선택하거나 [업로드]로 새 확인서를 올립니다."
            >
              <DocPicker placeholder="문서 선택" options={[{ value: 'doc1', label: '태양광 설치 확인서.pdf' }]} />
            </FormField>

            <div>
              <p className="mb-2 text-sm font-medium text-on-surface">월별 자가발전량 (문서에서 자동 추출)</p>
              <UsageTable
                rows={data.genRows}
                monthLabel="기록 연월"
                amountLabel="자가발전량"
                unit="kWh"
                addLabel="발전량 기록 추가"
              />
            </div>

            <ReadonlyField label="단위 기간 자가발전량 합계" value={numberFmt(genSum)} unit="kWh" source="calculated" help="태양광 등으로 직접 만들어 쓴 전기를 월별로 더한 값입니다. 이만큼은 배출량이 0으로 처리됩니다." />
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
            helpWide
            source="measured"
            help={
              <HelpOptions
                intro="로스터기에 쓰는 가스 종류를 고릅니다. 고지서나 가스 계약서를 보면 알 수 있어요."
                items={[
                  { term: '천연가스 (도시가스)', desc: '배관으로 들어오는 가스로, 매달 도시가스 고지서를 받습니다.' },
                  { term: 'LPG', desc: '통(용기)이나 탱크로 받아 쓰는 가스입니다.' },
                ]}
                outro="고른 종류에 따라 사용량 단위 선택지가 달라집니다."
              />
            }
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
            rows={data.gasBills}
            amountLabel="가스 사용량"
            unitOptions={gasUnitOptions}
            addLabel="가스 고지서 추가"
            docLabel="가스 고지서"
          />

          <p className="text-xs text-on-surface-variant">
            가스 배출량(Scope 1)은 마지막 <b className="font-medium text-on-surface">결과</b> 단계에서 계산되어 표시됩니다.
          </p>
        </SectionCard>
      )}

      {/* Section D — 채프 발생량 (자동) */}
      <SectionCard
        title={`${fuel === 'elec_gas' ? '4' : '3'}. 커피 껍질(채프) 발생량`}
        description="로스팅 중 떨어져 나오는 얇은 껍질입니다. 채프 발생량은 품종별 실측값(Bytof et al., 2024)에 세계 생산·수출 비중을 가중한 생두 1kg당 5.7g을 적용해 자동 계산됩니다. 이 값은 폐기 단계-폐기물 발생량으로 자동 이어집니다."
      >
        <ReadonlyField
          label="채프 발생량"
          value="—"
          unit="kg"
          source="literature"
          help="생두 1kg당 5.7g(품종별 실측값에 생산·수출 비중을 가중한 문헌값)을 적용해 자동 계산한 값입니다."
        />
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
  docLabel,
}: {
  rows: BillRow[];
  amountLabel: string;
  unit?: string;
  unitOptions?: { value: string; label: string }[];
  addLabel: string;
  docLabel: string;
}) {
  return (
    <div>
      <FormField
        label={`${docLabel} (문서 선택 · 업로드)`}
        hint="업로드한 고지서에서 선택하거나 [업로드]로 새 고지서를 올리면 월별 사용량이 자동으로 채워집니다. 데이터 수집 기간의 월별 고지서를 여러 장 올릴 수 있습니다."
      >
        <DocPicker placeholder={`${docLabel} 선택`} />
      </FormField>
      <p className="mb-2 mt-4 text-sm font-medium text-on-surface">월별 사용 내역 (문서에서 자동 추출)</p>
      <UsageTable
        rows={rows}
        monthLabel="발행 연월"
        amountLabel={amountLabel}
        unit={unit}
        unitOptions={unitOptions}
        addLabel={addLabel}
        showProvider
      />
    </div>
  );
}

/**
 * 월별 사용 내역 테이블 (고지서·자가발전량 공통).
 * 카드 12개 대신 A:연월 · B:사용량 · C:발급처(선택) 순의 테이블로 표시한다.
 * - 자동 추출(OCR) 행은 왼쪽 색 바 + ScanLine 아이콘으로 표시
 * - 연월이 비어 있으면(OCR 인식 실패 등) "연월 확인 필요" 경고 노출
 * - 좁은 화면은 컨테이너 가로 스크롤로 대응
 */
function UsageTable({
  rows,
  monthLabel,
  amountLabel,
  unit,
  unitOptions,
  addLabel,
  showProvider = false,
}: {
  rows: { month: string; amount: number; provider?: string }[];
  monthLabel: string;
  amountLabel: string;
  unit?: string;
  unitOptions?: { value: string; label: string }[];
  addLabel: string;
  showProvider?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-outline-variant">
      <div className="overflow-x-auto">
        <table className="w-full min-w-130 border-collapse text-sm">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-left text-xs font-medium text-on-surface-variant">
              <th scope="col" className="w-24 px-3 py-2" title="이 행의 데이터 출처 등급">
                출처
              </th>
              <th scope="col" className="px-3 py-2">{monthLabel}</th>
              <th scope="col" className="px-3 py-2">{amountLabel}</th>
              {showProvider && <th scope="col" className="px-3 py-2">발급처</th>}
              <th scope="col" className="w-11 px-2 py-2" aria-label="삭제" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const noMonth = !row.month;
              return (
                <tr key={idx} className="border-b border-outline-variant last:border-b-0">
                  <td className="border-l-2 border-primary/50 px-3 py-2 align-top">
                    <div className="mt-2">
                      <SourceBadge source="measured" ocr />
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <TextInput type="month" defaultValue={row.month} />
                    {noMonth && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-error">
                        <AlertTriangle className="h-3 w-3" /> 연월 확인 필요
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <AmountWithUnit defaultValue={row.amount} unit={unit} unitOptions={unitOptions} />
                  </td>
                  {showProvider && (
                    <td className="px-3 py-2 align-top">
                      <TextInput defaultValue={row.provider} />
                    </td>
                  )}
                  <td className="px-2 py-2 text-center align-top">
                    <div className="mt-1">
                      <DeleteButton />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t border-outline-variant bg-surface-container-low px-3 py-1.5">
        <AddButton label={addLabel} />
      </div>
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
