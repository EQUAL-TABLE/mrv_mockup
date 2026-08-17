import { ReadonlyField } from '@/components/ui/form';
import { SectionCard } from '@/components/workspace/SectionCard';
import { DEFAULT_PROJECT_DATA, scenarioLabel } from '@/data/projectData';
import type { ProjectData } from '@/data/projectData';

/**
 * ⑧ 사용단계 — ISO 14067 · 폐기까지 전용 (읽기전용·전량 자동 산출).
 *
 * 기본정보에서 확정한 사용 방식 시나리오(드립/에스프레소/콜드브루) 기준으로
 * 분쇄·추출 전력 원단위를 문헌값으로 자동 적용한다. 사용자 입력 없음.
 * (환경성적표지는 사용단계 제외 → 이 화면 없음)
 */

/** 추출 전력 원단위 문헌값 (kWh/kg) — 시나리오별 상이 */
const EXTRACT_UNIT: Record<ProjectData['production']['scenario'], string> = {
  drip: '3.771',
  espresso: '0.435',
  coldbrew: '0',
};

/** 시나리오별 산정 가정 문구 — 커피:물 비율·1잔 원두량·추출 전력 기준이 시나리오마다 다름 */
const SCENARIO_ASSUMPTION: Record<ProjectData['production']['scenario'], string> = {
  drip: '커피:물 = 1:15 | 1잔 원두 10g | 추출 전력 0.022 kWh/100ml 기준. | 뜨거운 물을 필터에 통과시켜 추출하며, 물 가열에 전력이 크게 소요됩니다.',
  espresso: '커피:물 = 1:2 | 1잔 원두 7g | 추출 전력 0.003 kWh/100ml 기준. | 고압·소량 추출로 잔당 물 사용량이 적어 추출 전력 원단위가 낮습니다.',
  coldbrew: '커피:물 = 1:10 | 1잔 원두 12g | 추출 전력 0 kWh/100ml 기준. | 상온·저온에서 장시간 침출하므로 가열 전력이 발생하지 않습니다.',
};

export function Usage({ data = DEFAULT_PROJECT_DATA }: { data?: ProjectData } = {}) {
  const scenario = data.production.scenario;
  return (
    <div className="space-y-4">
      <SectionCard title="사용 방식 · 전력 원단위" description="선택한 시나리오에 따라 분쇄·추출 전력이 자동 적용됩니다.">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadonlyField label="선택한 사용 방식" value={scenarioLabel(scenario)} source="calculated" help="기본정보에서 고른 사용 방식 시나리오가 자동으로 연결됩니다." />
          <ReadonlyField label="분쇄 전력 원단위" value="0.019" unit="kWh/kg" source="literature" help="원두 1kg을 분쇄(그라인딩)할 때 드는 전기량입니다. 커피 분쇄 굵기에 대한 전력 차이는 고려하지 않으며 분쇄 전력 원단위는 관련 논문의 근거하여 0.019 kWh/kg으로 고정값을 적용합니다. " />
          <ReadonlyField
            label="추출 전력 원단위"
            value={EXTRACT_UNIT[scenario]}
            unit="kWh/kg"
            source="literature"
            help="원두 1kg을 커피로 추출할 때 드는 사용된 전기량입니다. 추출 방식에 따라 전력 사용량은 다음과 같이 상이하며, 이는 문헌에 근거하여 결정되었습니다. (드립 3.771 | 에스프레소 0.435 | 콜드브루 0 kWh/kg)"
          />
        </div>
      </SectionCard>

      <SectionCard title="시나리오 가정" description={`선택한 사용 방식(${scenarioLabel(scenario)}) 기준 문헌값 자동 산정에 사용된 가정입니다.`}>
        <div className=" p-0.5 text-sm leading-relaxed text-on-surface-variant">
          {SCENARIO_ASSUMPTION[scenario]} 
          <br /> 단, 실제 기기 사양·사용 패턴에 따라 편차가 있을 수 있다.
        </div>
      </SectionCard>
    </div>
  );
}
