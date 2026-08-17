import { AlertTriangle } from 'lucide-react';
import { SectionCard } from '@/components/workspace/SectionCard';
import { StageBars } from '@/components/workspace/StageBars';
import { FormField, HelpOptions, InfoBanner, ReadonlyField, Select, SourceBadge, UnitInput } from '@/components/ui/form';
import type { DataSource } from '@/components/ui/form';
import { DEFAULT_PROJECT_DATA, scenarioLabel } from '@/data/projectData';
import type { ProjectData } from '@/data/projectData';
import type { Boundary } from '@/types/project';

/**
 * 계산기(Calculator) 트랙 화면 — 입력이 간단하고 결과가 간단히 산출되는 형태.
 * 설계 문서(계산기 트랙 간소화 / data_fields v2.0.4) 기준.
 */

/* ③ 원부자재 (입력) */
export function CalcMaterials({ boundary, data = DEFAULT_PROJECT_DATA }: { boundary: Boundary; data?: ProjectData }) {
  const isGrave = boundary === 'grave';
  return (
    <div className="space-y-4">
      <SectionCard title="생두" description="생두를 재배·수확하는 과정에서 발생한 탄소량입니다. 값을 모르면 기본값을 그대로 사용하세요.">
        <FormField
          label="생두 단위 탄소배출량"
          required
          source="literature"
          help="생두 1kg을 생산할 때 발생하는 탄소량입니다. 기본값은 문헌값(Nab & Maslin, 2020)이며, 공급자 자료가 있으면 바꿔 입력하세요."
        >
          <UnitInput unit="kg CO₂e/kg" type="number" defaultValue={data.farms[0].beanEmission} step="0.001" />
        </FormField>
        <InfoBanner>
          포대 정보는 표준값으로 자동 처리됩니다. (황마 60kg 포대 · 개당 황마 1,000g / PP 300g)
        </InfoBanner>
      </SectionCard>

      <SectionCard title="최소포장재" description="원두를 담는 봉투 등 포장재 정보를 입력합니다.">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="포장재 종류"
            required
            helpWide
            source="literature"
            help={
              <HelpOptions
                intro="원두 봉투 재질을 미리 정해진 3종 중에서 고릅니다. 고르면 해당 재질의 탄소량이 자동 적용돼 따로 숫자를 넣지 않아도 돼요."
                items={[
                  { term: '알루미늄 합지', desc: '안쪽에 은박(알루미늄)이 있는 봉투입니다. 빛·산소 차단이 좋아 흔히 씁니다.' },
                  { term: '증착 삼중지', desc: '얇은 금속막을 입힌 3겹 필름 봉투입니다.' },
                  { term: '크라프트 삼중지', desc: '겉이 갈색 종이(크라프트) 느낌인 3겹 봉투입니다.' },
                ]}
              />
            }
          >
            <Select
              options={[
                { value: 'al', label: '알루미늄 합지' },
                { value: 'deposition', label: '증착 삼중지' },
                { value: 'kraft', label: '크라프트 삼중지' },
              ]}
            />
          </FormField>
          <FormField label="봉투 1개 무게" required source="estimated">
            <UnitInput unit="g" type="number" placeholder="0" />
          </FormField>
          <FormField label="봉투 1개 포장량" required helpWide source="estimated" help="봉투 하나에 담는 원두 양입니다. 예를 들어 250g 봉투면 250을 넣으세요. 이 값으로 필요한 봉투 개수를 자동 계산합니다.">
            <UnitInput unit="g/ea" type="number" placeholder="0" />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadonlyField label="단위 기간 사용량" value="—" unit="ea" source="calculated" help="전체 생산량을 봉투 1개 포장량으로 나눠, 기간 동안 쓴 봉투 개수를 자동 계산한 값입니다." />
          <ReadonlyField label="총 사용 중량" value="—" unit="kg" source="calculated" />
        </div>
      </SectionCard>

      {isGrave && (
        <SectionCard title="여과지" description="드립 방식일 때 사용하는 여과지입니다.">
          <InfoBanner>
            사용 방식이 ‘드립’이면 여과지가 자동 포함되며, 사용량은 생산량 기준으로 자동 계산됩니다. (원두 14g당 1.6g)
          </InfoBanner>
          <ReadonlyField label="여과지 총 질량" value="—" unit="kg" source="literature" help="원두 14g당 여과지 1.6g이라는 문헌 비율과 생산량으로 자동 계산합니다." />
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
          <FormField label="수출국 내륙 수송 거리" required source="estimated" help="산지 농장에서 수출항까지 트럭 이동 거리">
            <UnitInput unit="km" type="number" placeholder="0" />
          </FormField>
          <ReadonlyField label="수송 수단" value="트럭 (고정)" source="literature" help="계산기 방식은 내륙 구간 수송수단을 트럭으로 고정 가정합니다." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="국제 수송 거리" required source="estimated" help="수출항에서 수입항까지">
            <UnitInput unit="km" type="number" placeholder="0" />
          </FormField>
          <FormField
            label="국제 수송 수단"
            required
            helpWide
            source="estimated"
            help={
              <HelpOptions
                intro="생두를 해외에서 들여올 때 이용한 방법을 고릅니다."
                items={[
                  { term: '선박', desc: '배로 운송합니다. 느리지만 배출량이 매우 적어요.' },
                  { term: '항공', desc: '비행기로 운송합니다. 빠르지만 배출량이 훨씬 큽니다.' },
                ]}
              />
            }
          >
            <Select options={[{ value: 'ship', label: '선박' }, { value: 'air', label: '항공' }]} />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="수입국 내륙 수송 거리" required source="estimated" help="수입항에서 로스터리까지">
            <UnitInput unit="km" type="number" placeholder="0" />
          </FormField>
          <ReadonlyField label="수송 수단" value="트럭 (고정)" source="literature" help="계산기 방식은 내륙 구간 수송수단을 트럭으로 고정 가정합니다." />
        </div>
      </SectionCard>

      <SectionCard title="부자재 수송" description="포장재 등 부자재가 로스터리까지 오는 거리를 입력합니다. (수송 수단은 트럭 고정)">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="최소포장재 수송 거리" required source="estimated">
            <UnitInput unit="km" type="number" placeholder="0" />
          </FormField>
          <ReadonlyField label="수송 수단" value="트럭 (고정)" source="literature" help="부자재 수송수단은 트럭으로 고정 가정합니다." />
        </div>
        {isGrave && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="여과지 수송 거리" required source="estimated">
              <UnitInput unit="km" type="number" placeholder="0" />
            </FormField>
            <ReadonlyField label="수송 수단" value="트럭 (고정)" source="literature" help="부자재 수송수단은 트럭으로 고정 가정합니다." />
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ⑥ 제조 (입력) */
export function CalcManufacturing({ fuel = 'elec_gas' }: { fuel?: 'elec' | 'elec_gas' }) {
  return (
    <div className="space-y-4">
      <SectionCard title="전력 (로스팅)" description="로스팅에 사용한 전력을 로스터기 사양과 가동시간으로 추정합니다.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="배치당 생두 투입량" required source="estimated" help="한 번 볶을 때 넣는 생두 양입니다. 총 배치 수 계산에 쓰입니다.">
            <UnitInput unit="kg" type="number" placeholder="0" />
          </FormField>
          <ReadonlyField label="총 배치 수" value="—" unit="회" source="calculated" help="전체 생두를 한 번에 볶는 양(배치당 투입량)으로 나눠, 총 몇 번 볶는지 자동 계산합니다. (소수점은 올림)" />
          <FormField label="로스터기 소비전력" required source="estimated">
            <UnitInput unit="kW" type="number" placeholder="0" />
          </FormField>
          <FormField label="배치당 사용시간" required source="estimated">
            <UnitInput unit="분" type="number" placeholder="0" />
          </FormField>
        </div>
        <ReadonlyField
          label="추정 전력 사용량"
          value="—"
          unit="kWh"
          source="calculated"
          help="로스터기 소비전력에 1회 볶는 시간(시간 단위로 환산)과 총 배치 수를 곱해 전기 사용량을 추정합니다."
        />
        {fuel === 'elec_gas' ? (
          <FormField label="가스 사용량" required source="estimated" help="기본정보에서 ‘전기 + 가스’를 선택해 가스 사용량 입력 항목이 추가되었습니다.">
            <UnitInput unit="Nm³" type="number" placeholder="0" />
          </FormField>
        ) : (
          <InfoBanner>
            전기 전용 로스터기로 설정되어 가스 입력은 표시되지 않습니다. 가스도 사용한다면 기본정보에서 ‘전기 + 가스’를 선택하세요.
          </InfoBanner>
        )}
      </SectionCard>

      <SectionCard title="커피 껍질(채프) 발생량" description="로스팅 중 떨어져 나오는 껍질입니다. 자동으로 계산됩니다.">
        <ReadonlyField label="채프 발생량" value="—" unit="kg" source="literature" help="로스팅할 때 생두에서 떨어져 나오는 얇은 껍질입니다. 생두 1kg당 약 5.7g이 나온다는 기준으로 자동 계산됩니다." />
      </SectionCard>
    </div>
  );
}

/* ⑧ 사용 (읽기전용·자동, 폐기까지에서만) */
const CALC_EXTRACT_UNIT: Record<ProjectData['production']['scenario'], string> = {
  drip: '3.771',
  espresso: '0.435',
  coldbrew: '0',
};
export function CalcUsage({ data = DEFAULT_PROJECT_DATA }: { data?: ProjectData }) {
  const scenario = data.production.scenario;
  return (
    <div className="space-y-4">
      <SectionCard title="사용 단계 (자동 계산)">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadonlyField label="선택한 사용 방식" value={scenarioLabel(scenario)} source="calculated" help="기본정보에서 고른 사용 방식 시나리오가 자동으로 연결됩니다." />
          <ReadonlyField label="분쇄 전력 원단위" value="0.019" unit="kWh/kg" source="literature" />
          <ReadonlyField label="추출 전력 원단위" value={CALC_EXTRACT_UNIT[scenario]} unit="kWh/kg" source="literature" help="원두 1kg을 커피로 내릴 때 드는 전기량입니다. 내리는 방식마다 달라요. 드립 3.771 · 에스프레소 0.435 · 콜드브루 0 kWh/kg." />
          <ReadonlyField label="사용 단계 배출량" value="—" unit="kg CO₂e/kg" source="calculated" help="분쇄와 추출에 든 전기량을 더해 전력 배출계수를 곱한 값입니다." />
        </div>
      </SectionCard>
    </div>
  );
}

/* ⑩ 폐기 처리 (읽기전용·자동) */
export function CalcWaste({ boundary }: { boundary: Boundary }) {
  const isGrave = boundary === 'grave';
  const items: { name: string; note: string; source: DataSource }[] = [
    { name: '생두 포장재', note: '황마·PP 포대', source: 'literature' },
    { name: '커피 껍질(채프)', note: '로스팅 부산물', source: 'literature' },
    ...(isGrave
      ? ([
          { name: '최소포장재', note: '원두 봉투', source: 'calculated' },
          { name: '커피박', note: '추출 후 찌꺼기', source: 'literature' },
          { name: '여과지', note: '드립 시', source: 'literature' },
        ] as const)
      : []),
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="폐기물 발생량 (자동)" description="앞 단계에서 자동으로 누적된 폐기물입니다.">
        <div className="divide-y divide-outline-variant overflow-hidden rounded-md border border-outline-variant">
          {items.map((it) => (
            <div key={it.name} className="flex items-center justify-between gap-3 bg-surface-container-lowest px-4 py-2.5 text-sm">
              <div className="min-w-0">
                <span className="font-medium text-on-surface">{it.name}</span>
                <span className="ml-1 text-xs text-on-surface-variant">· {it.note}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <SourceBadge source={it.source} />
                <span className="tabular-nums text-on-surface-variant">— kg</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="처리 방식 (자동)" description="계산기 방식은 국가 통계 기준의 평균 처리 비율을 적용합니다. (별도 입력 없음)">
        <div className="grid gap-3 sm:grid-cols-3">
          <ReadonlyField label="재활용" value="20.02" unit="%" source="literature" />
          <ReadonlyField label="소각" value="63.72" unit="%" source="literature" />
          <ReadonlyField label="매립" value="16.27" unit="%" source="literature" />
        </div>
        <ReadonlyField label="폐기 처리 배출량" value="—" unit="kg CO₂e/kg" source="calculated" />
      </SectionCard>
    </div>
  );
}

/* ⑫ 결과 (읽기전용·자동) */
export function CalcResult({ boundary, data = DEFAULT_PROJECT_DATA }: { boundary: Boundary; data?: ProjectData }) {
  const isGrave = boundary === 'grave';
  const st = data.result.stages;
  const stages = [
    { name: '제조전 - 원부자재', value: st.preMaterial },
    { name: '제조전 - 원료 수송', value: st.preTransport },
    { name: '제조 - 로스팅', value: st.manuf },
    ...(isGrave ? [{ name: '사용', value: st.usage }] : []),
    { name: '폐기 - 처리', value: st.waste },
  ];
  const total = stages.reduce((s, r) => s + r.value, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>본 결과는 <b className="font-semibold">참고용</b>이며 인증에 사용할 수 없습니다. 인증용 결과가 필요하면 MRV 방식으로 다시 산정하세요.</span>
      </div>

      <SectionCard title="단계별 탄소배출량" description="단위: kg CO₂e / 1kg 원두">
        <StageBars items={stages} />
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
