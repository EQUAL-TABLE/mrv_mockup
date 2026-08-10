import { AlertTriangle } from 'lucide-react';
import { SectionCard } from '@/components/workspace/SectionCard';
import { FormField, InfoBanner, ReadonlyField, Select, UnitInput } from '@/components/ui/form';
import type { Boundary } from '@/types/project';

/**
 * 계산기(Calculator) 트랙 화면 — 입력이 간단하고 결과가 간단히 산출되는 형태.
 * 설계 문서(계산기 트랙 간소화 / data_fields v2.0.4) 기준.
 */

/* ③ 원부자재 (입력) */
export function CalcMaterials({ boundary }: { boundary: Boundary }) {
  const isGrave = boundary === 'grave';
  return (
    <div className="space-y-4">
      <SectionCard title="생두" description="생두를 재배·수확하는 과정에서 발생한 탄소량입니다. 값을 모르면 기본값을 그대로 사용하세요.">
        <FormField
          label="생두 단위 탄소배출량"
          required
          help="생두 1kg을 생산할 때 발생하는 탄소량입니다. 기본값은 문헌값(Nab & Maslin, 2020)이며, 공급자 자료가 있으면 바꿔 입력하세요."
        >
          <UnitInput unit="kg CO₂e/kg" type="number" defaultValue={1.165} step="0.001" />
        </FormField>
        <InfoBanner>
          포대 정보는 표준값으로 자동 처리됩니다. (황마 60kg 포대 · 개당 황마 1,000g / PP 300g)
        </InfoBanner>
      </SectionCard>

      <SectionCard title="최소포장재" description="원두를 담는 봉투 등 포장재 정보를 입력합니다.">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="포장재 종류" required help="사전 정의된 3종 중 선택하면 배출계수가 자동 적용됩니다.">
            <Select
              options={[
                { value: 'al', label: '알루미늄 합지' },
                { value: 'deposition', label: '증착 삼중지' },
                { value: 'kraft', label: '크라프트 삼중지' },
              ]}
            />
          </FormField>
          <FormField label="봉투 1개 무게" required>
            <UnitInput unit="g" type="number" placeholder="0" />
          </FormField>
          <FormField label="봉투 1개 포장량" required help="봉투 하나에 담기는 원두 양입니다.">
            <UnitInput unit="g/ea" type="number" placeholder="0" />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadonlyField label="단위 기간 사용량" value="—" unit="ea" help="생산량과 포장량으로 자동 계산됩니다." />
          <ReadonlyField label="총 사용 중량" value="—" unit="kg" />
        </div>
      </SectionCard>

      {isGrave && (
        <SectionCard title="여과지" description="드립 방식일 때 사용하는 여과지입니다.">
          <InfoBanner>
            사용 방식이 ‘드립’이면 여과지가 자동 포함되며, 사용량은 생산량 기준으로 자동 계산됩니다. (원두 14g당 1.6g)
          </InfoBanner>
          <ReadonlyField label="여과지 총 질량" value="—" unit="kg" />
        </SectionCard>
      )}
    </div>
  );
}

/* ④ 원료 수송 (입력) */
export function CalcTransport({ boundary }: { boundary: Boundary }) {
  const isGrave = boundary === 'grave';
  return (
    <div className="space-y-4">
      <SectionCard
        title="생두 수송"
        description="생두가 산지에서 로스터리까지 오는 구간별 이동 거리를 입력합니다. 수송량은 생두 투입량으로 자동 연결됩니다."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="수출국 내륙 수송 거리" required help="산지 농장에서 수출항까지 트럭 이동 거리">
            <UnitInput unit="km" type="number" placeholder="0" />
          </FormField>
          <ReadonlyField label="수송 수단" value="트럭 (고정)" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="국제 수송 거리" required help="수출항에서 수입항까지">
            <UnitInput unit="km" type="number" placeholder="0" />
          </FormField>
          <FormField label="국제 수송 수단" required>
            <Select options={[{ value: 'ship', label: '선박' }, { value: 'air', label: '항공' }]} />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="수입국 내륙 수송 거리" required help="수입항에서 로스터리까지">
            <UnitInput unit="km" type="number" placeholder="0" />
          </FormField>
          <ReadonlyField label="수송 수단" value="트럭 (고정)" />
        </div>
      </SectionCard>

      <SectionCard title="부자재 수송" description="포장재 등 부자재가 로스터리까지 오는 거리를 입력합니다. (수송 수단은 트럭 고정)">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="최소포장재 수송 거리" required>
            <UnitInput unit="km" type="number" placeholder="0" />
          </FormField>
          <ReadonlyField label="수송 수단" value="트럭 (고정)" />
        </div>
        {isGrave && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="여과지 수송 거리" required>
              <UnitInput unit="km" type="number" placeholder="0" />
            </FormField>
            <ReadonlyField label="수송 수단" value="트럭 (고정)" />
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ⑥ 제조 (입력) */
export function CalcManufacturing() {
  return (
    <div className="space-y-4">
      <SectionCard title="전력 (로스팅)" description="로스팅에 사용한 전력을 로스터기 사양과 가동시간으로 추정합니다.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="배치당 생두 투입량" required help="한 번 볶을 때 넣는 생두 양입니다. 총 배치 수 계산에 쓰입니다.">
            <UnitInput unit="kg" type="number" placeholder="0" />
          </FormField>
          <ReadonlyField label="총 배치 수" value="—" unit="회" help="생두 투입량 ÷ 배치당 투입량 (올림)" />
          <FormField label="로스터기 소비전력" required>
            <UnitInput unit="kW" type="number" placeholder="0" />
          </FormField>
          <FormField label="배치당 사용시간" required>
            <UnitInput unit="분" type="number" placeholder="0" />
          </FormField>
        </div>
        <ReadonlyField
          label="추정 전력 사용량"
          value="—"
          unit="kWh"
          help="소비전력 × 배치당 사용시간 ÷ 60 × 총 배치 수"
        />
        <InfoBanner>
          가스 로스터기를 함께 사용하는 경우, 기본정보에서 ‘전기 + 가스’를 선택하면 가스 사용량 입력 항목이 추가됩니다.
        </InfoBanner>
      </SectionCard>

      <SectionCard title="커피 껍질(채프) 발생량" description="로스팅 중 떨어져 나오는 껍질입니다. 자동으로 계산됩니다.">
        <ReadonlyField label="채프 발생량" value="—" unit="kg" help="생두 투입량 × 0.0057 (생두 1kg당 5.7g)" />
      </SectionCard>
    </div>
  );
}

/* ⑧ 사용 (읽기전용·자동, 폐기까지에서만) */
export function CalcUsage() {
  return (
    <div className="space-y-4">
      <InfoBanner>
        이 단계는 입력할 것이 없습니다. 기본정보에서 선택한 사용 방식 기준으로, 소비자가 커피를 내릴 때 쓰는 전력을 자동 계산합니다.
      </InfoBanner>
      <SectionCard title="사용 단계 (자동 계산)">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadonlyField label="선택한 사용 방식" value="드립" />
          <ReadonlyField label="분쇄 전력 원단위" value="0.019" unit="kWh/kg" />
          <ReadonlyField label="추출 전력 원단위" value="3.771" unit="kWh/kg" help="드립 3.771 / 에스프레소 0.435 / 콜드브루 0" />
          <ReadonlyField label="사용 단계 배출량" value="—" unit="kg CO₂e/kg" help="(분쇄 + 추출 원단위) × 전력 배출계수" />
        </div>
      </SectionCard>
    </div>
  );
}

/* ⑩ 폐기 처리 (읽기전용·자동) */
export function CalcWaste({ boundary }: { boundary: Boundary }) {
  const isGrave = boundary === 'grave';
  const items = [
    { name: '생두 포장재', note: '황마·PP 포대' },
    { name: '커피 껍질(채프)', note: '로스팅 부산물' },
    ...(isGrave
      ? [
          { name: '최소포장재', note: '원두 봉투' },
          { name: '커피박', note: '추출 후 찌꺼기' },
          { name: '여과지', note: '드립 시' },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <InfoBanner>
        이 단계는 입력할 것이 없습니다. 앞 단계에서 발생한 폐기물의 양과 처리 방식을 자동으로 반영합니다.
      </InfoBanner>
      <SectionCard title="폐기물 발생량 (자동)" description="앞 단계에서 자동으로 누적된 폐기물입니다.">
        <div className="divide-y divide-outline-variant overflow-hidden rounded-md border border-outline-variant">
          {items.map((it) => (
            <div key={it.name} className="flex items-center justify-between bg-surface-container-lowest px-4 py-2.5 text-sm">
              <div>
                <span className="font-medium text-on-surface">{it.name}</span>
                <span className="ml-1 text-xs text-on-surface-variant">· {it.note}</span>
              </div>
              <span className="tabular-nums text-on-surface-variant">— kg</span>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="처리 방식 (자동)" description="계산기 방식은 국가 통계 기준의 평균 처리 비율을 적용합니다. (별도 입력 없음)">
        <div className="grid gap-3 sm:grid-cols-3">
          <ReadonlyField label="재활용" value="20.02" unit="%" />
          <ReadonlyField label="소각" value="63.72" unit="%" />
          <ReadonlyField label="매립" value="16.27" unit="%" />
        </div>
        <ReadonlyField label="폐기 처리 배출량" value="—" unit="kg CO₂e/kg" />
      </SectionCard>
    </div>
  );
}

/* ⑫ 결과 (읽기전용·자동) */
export function CalcResult({ boundary }: { boundary: Boundary }) {
  const isGrave = boundary === 'grave';
  const stages = [
    { name: '제조 전 (원료·수송)', value: 2.34, pct: 47 },
    { name: '제조 (로스팅)', value: 1.62, pct: 32 },
    ...(isGrave ? [{ name: '사용', value: 0.72, pct: 14 }] : []),
    { name: '폐기 처리', value: 0.34, pct: isGrave ? 7 : 21 },
  ];
  const total = isGrave ? 5.02 : 4.3;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>본 결과는 <b className="font-semibold">참고용</b>이며 인증에 사용할 수 없습니다. 인증용 결과가 필요하면 MRV 방식으로 다시 산정하세요.</span>
      </div>

      <SectionCard title="단계별 탄소배출량" description="단위: kg CO₂e / 1kg 원두">
        <div className="space-y-3">
          {stages.map((s) => (
            <div key={s.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-on-surface">{s.name}</span>
                <span className="tabular-nums font-medium text-on-surface">{s.value.toFixed(2)} <span className="text-xs text-on-surface-variant">({s.pct}%)</span></span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-primary" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="최종 탄소발자국">
        <div className="rounded-md border border-primary/30 bg-primary/5 p-5">
          <p className="text-sm text-on-surface-variant">추정 탄소발자국 (참고용)</p>
          <p className="mt-1">
            <span className="text-3xl font-bold tabular-nums text-primary">{total.toFixed(2)}</span>{' '}
            <span className="text-sm font-medium text-on-surface-variant">kg CO₂e/kg</span>
          </p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <ReadonlyField label="Scope 1 (직접 연소)" value="—" unit="kg CO₂e/kg" />
          <ReadonlyField label="Scope 2 (구매 전력)" value="—" unit="kg CO₂e/kg" />
          <ReadonlyField label="Scope 3 (그 외)" value="—" unit="kg CO₂e/kg" />
        </div>
      </SectionCard>
    </div>
  );
}
