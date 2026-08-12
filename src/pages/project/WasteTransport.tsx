import { Recycle, Flame, Trash2 } from 'lucide-react';
import type { ComponentType } from 'react';
import { InfoBanner, ReadonlyField } from '@/components/ui/form';
import { SectionCard } from '@/components/workspace/SectionCard';
import type { Boundary } from '@/types/project';

/**
 * ⑨ 폐기단계-수송 — ISO 14067 전용 (읽기전용·전량 자동 산출).
 *
 * 폐기물을 처리방식별(소각·매립·재활용) 공공처리시설로 수송하는 거리·배출량을 자동 산출.
 * 사용자 입력 없음. (환경성적표지는 폐기 수송 미포함 → 이 화면 없음)
 * 폐기물별 수송 기준점: 생두포장재·채프=로스터리 / 그 외=납품처(자체 소비 시 로스터리).
 */

interface Props {
  boundary?: Boundary;
}

export function WasteTransport({ boundary = 'grave' }: Props = {}) {
  const grave = boundary === 'grave';
  const wastes = grave
    ? ['생두 포장재', '채프', '최소포장재', '커피박', '여과지(드립)']
    : ['생두 포장재', '채프'];

  return (
    <div className="space-y-4">
      <SectionCard title="대상 폐기물 · 수송 기준점 (자동)" description="폐기물이 어디서 발생하는지에 따라 수송 출발지가 정해집니다.">
        <div className="divide-y divide-outline-variant overflow-hidden rounded-md border border-outline-variant">
          {wastes.map((w) => {
            const atRoastery = w === '생두 포장재' || w === '채프';
            return (
              <div key={w} className="flex items-center justify-between bg-surface-container-lowest px-4 py-2.5 text-sm">
                <span className="font-medium text-on-surface">{w}</span>
                <span className="text-xs text-on-surface-variant">발생 위치: {atRoastery ? '로스터리' : '납품처'}</span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="처리방식별 시설 매핑 · 거리 (자동)"
        description="국가 통계 기준 처리 비율에 따라 각 처리시설까지의 거리를 자동으로 산출합니다. 수송수단은 트럭으로 고정됩니다."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <FacilityCard Icon={Recycle} label="재활용 시설" />
          <FacilityCard Icon={Flame} label="소각 시설" />
          <FacilityCard Icon={Trash2} label="매립 시설" />
        </div>
        <p className="text-xs text-on-surface-variant">
          폐기 수송 배출량은 마지막 <b className="font-medium text-on-surface">결과</b> 단계에서 계산되어 표시됩니다.
        </p>
      </SectionCard>

      <InfoBanner>
        처리시설 위치는 환경부 「전국 폐기물 발생 및 처리현황」 공시 자료 기준이며, 동일 시군구 시설을 우선 적용하고 없으면
        인접 시군구 시설을 적용합니다.
      </InfoBanner>
    </div>
  );
}

function FacilityCard({ Icon, label }: { Icon: ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-lowest p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-2">
        <ReadonlyField label="수송 거리" value="—" unit="km" />
      </div>
    </div>
  );
}
