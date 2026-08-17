import { Recycle, Flame, Trash2, Factory, Store } from 'lucide-react';
import type { ComponentType } from 'react';
import { InfoBanner, ReadonlyField, SourceBadge } from '@/components/ui/form';
import { SectionCard } from '@/components/workspace/SectionCard';
import type { Boundary } from '@/types/project';

/**
 * ⑨ 폐기단계-수송 — ISO 전용 (읽기전용·전량 자동 산출).
 *
 * 폐기물을 처리방식별(재활용·소각·매립) 공공처리시설로 수송하는 거리·중량을 자동 산출.
 * 사용자 입력 없음. (환경성적표지는 폐기 수송 미포함 → 이 화면 없음)
 *
 * 시설 매핑은 "폐기물 발생 위치 시군구" 기준이므로 발생 위치별로 시설·거리가 각각 달라진다.
 *   - 로스터리 기준: 생두 포장재·채프 (사업장 주소)
 *   - 납품처 기준: 최소포장재·커피박·여과지 (납품처 주소, 자체 소비 시 로스터리)
 * 경계 분기: 제품 생산까지는 제품유통·사용 단계가 없어 로스터리 기준만 존재한다.
 */

/** 국가 통계(전국 폐기물 발생 및 처리현황) 기준 잔여량 처리 비율 — 폐기단계-처리 화면과 동일 값 */
const FACILITIES = [
  { label: '재활용 시설', Icon: Recycle, ratio: '20.02' },
  { label: '소각 시설', Icon: Flame, ratio: '63.72' },
  { label: '매립 시설', Icon: Trash2, ratio: '16.27' },
] as const;

interface Props {
  boundary?: Boundary;
}

export function WasteTransport({ boundary = 'grave' }: Props = {}) {
  const grave = boundary === 'grave';

  const origins = [
    {
      key: 'roastery',
      label: '로스터리 기준',
      Icon: Factory,
      place: '기본정보의 사업장 주소 시군구',
      wastes: ['생두 포장재', '채프'],
      show: true,
    },
    {
      key: 'delivery',
      label: '납품처 기준',
      Icon: Store,
      place: '제품유통의 납품처 주소 시군구 (자체 소비 시 로스터리 시군구)',
      wastes: ['최소포장재', '커피박', '여과지(드립)'],
      show: grave,
    },
  ].filter((o) => o.show);

  return (
    <div className="space-y-4">
      <SectionCard
        title="발생 위치별 처리시설 매핑 · 거리 · 수송 중량 (자동)"
        description="폐기물이 어디서 발생하는지에 따라 수송 출발지가 정해지고, 그 시군구의 처리시설까지 거리가 각각 산출됩니다. 수송수단은 트럭으로 고정됩니다."
      >
      {!grave && (
        <InfoBanner>
          <b className="font-medium text-on-surface">제품 생산까지</b> 경계에서는 제품유통·사용 단계가 없어 납품처에서
          발생하는 폐기물(최소포장재·커피박·여과지)이 산정 범위에 포함되지 않습니다. 따라서 로스터리 기준 수송만
          산출됩니다.
        </InfoBanner>
      )}

      <InfoBanner>
        처리시설 위치는 환경부 「전국 폐기물 발생 및 처리현황」 공시 자료 기준이며, 발생 위치와 동일한 시군구 시설을 우선
        적용하고 없으면 인접 시군구 시설을 적용합니다. 두 기준점이 같은 시군구면 매핑되는 시설·거리도 같아집니다.
      </InfoBanner>

        {origins.map((o) => (
          <div key={o.key} className="rounded-md border border-outline-variant">
            {/* 그룹 머리 — 이 기준점에서 나오는 폐기물과 발생량 */}
            <div className="border-b border-outline-variant bg-surface-container-low px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface">
                  <o.Icon className="h-4 w-4 text-primary" /> {o.label}
                </span>
                <span className="text-xs text-on-surface-variant">수송 출발지: {o.place}</span>
              </div>
              <div className="mt-2.5 divide-y divide-outline-variant overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest">
                {o.wastes.map((w) => (
                  <div key={w} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="text-on-surface">{w}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <SourceBadge source="calculated" />
                      <span className="tabular-nums text-on-surface-variant">— kg</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="font-medium text-on-surface">발생량 합계</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <SourceBadge source="calculated" />
                    <span className="font-medium tabular-nums text-on-surface">— kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 처리방식별 시설 — 발생량을 처리 비율로 나눠 각 시설로 수송 */}
            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {FACILITIES.map((f) => (
                <FacilityCard key={f.label} Icon={f.Icon} label={f.label} ratio={f.ratio} />
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs text-on-surface-variant">
          수송 중량은 발생량 합계를 <b className="font-medium text-on-surface">폐기단계 · 처리</b> 단계의 처리 비율로 나눈
          값입니다. 재활용 위탁처리 증빙을 등록하면 그 중량만큼 재활용으로 먼저 배분되어 비율이 달라집니다. 폐기 수송
          배출량은 마지막 <b className="font-medium text-on-surface">결과</b> 단계에서 계산되어 표시됩니다.
        </p>
      </SectionCard>


    </div>
  );
}

function FacilityCard({
  Icon,
  label,
  ratio,
}: {
  Icon: ComponentType<{ className?: string }>;
  label: string;
  ratio: string;
}) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-lowest p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium tabular-nums text-primary">
          {ratio}%
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-on-surface-variant">시설명: — (자동 매핑)</p>
        <SourceBadge source="literature" />
      </div>
      <div className="mt-2 space-y-2">
        <ReadonlyField label="수송 거리" value="—" unit="km" source="calculated" />
        <ReadonlyField label="수송 중량" value="—" unit="kg" source="calculated" />
      </div>
    </div>
  );
}
