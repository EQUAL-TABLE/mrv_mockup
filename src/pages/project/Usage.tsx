import { InfoBanner, ReadonlyField } from '@/components/ui/form';
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

/** 추출 전력 원단위 문헌값 (kWh/kg) — 시나리오 공통 고정값 */
const EXTRACT_UNIT: Record<ProjectData['production']['scenario'], string> = {
  drip: '3.771',
  espresso: '0.435',
  coldbrew: '0',
};

export function Usage({ data = DEFAULT_PROJECT_DATA }: { data?: ProjectData } = {}) {
  const scenario = data.production.scenario;
  return (
    <div className="space-y-4">
      <InfoBanner>
        소비자가 커피를 내려 마실 때 쓰는 전력을 자동으로 계산합니다. 따로 입력할 것은 없으며, 기본정보에서 고른{' '}
        <b className="font-medium text-on-surface">사용 방식({scenarioLabel(scenario)})</b> 기준으로 문헌값이 적용됩니다.
      </InfoBanner>

      <SectionCard title="사용 방식 · 전력 원단위 (자동)" description="선택한 시나리오에 따라 분쇄·추출 전력이 자동 적용됩니다.">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadonlyField label="선택한 사용 방식" value={scenarioLabel(scenario)} />
          <ReadonlyField label="분쇄 전력 원단위" value="0.019" unit="kWh/kg" help="시나리오 공통 고정값. 출처: Páez et al. (2018)" />
          <ReadonlyField
            label="추출 전력 원단위"
            value={EXTRACT_UNIT[scenario]}
            unit="kWh/kg"
            help="드립 3.771 / 에스프레소 0.435 / 콜드브루 0. 출처: Shadow PEFCR (ECF, 2025)"
          />
          <ReadonlyField label="사용단계 배출량" value="—" unit="kg CO₂e/kg" help="(분쇄 + 추출 원단위) × 전력 배출계수. 결과 단계에서 표시됩니다." />
        </div>
      </SectionCard>

      <SectionCard title="시나리오 가정" description="문헌값 기반 자동 산정에 사용된 가정입니다.">
        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-sm leading-relaxed text-on-surface-variant">
          커피:물 = 1:15 · 1잔 원두 7g · 추출 전력 0.022 kWh/100ml 기준. 실제 기기 사양·사용 패턴에 따라 편차가 있을 수 있으며,
          이 가정은 보고서에 자동 기재됩니다.
        </div>
      </SectionCard>
    </div>
  );
}
