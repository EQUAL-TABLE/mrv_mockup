import { useState } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import { DocPicker, FormField, InfoBanner, OcrBadge, ReadonlyField, Select, SourceBadge, UnitInput } from '@/components/ui/form';
import type { DataSource } from '@/components/ui/form';
import type { Boundary, Methodology } from '@/types/project';

/**
 * ⑩ 폐기단계-처리 — MRV 공통(방법론·경계 분기).
 *
 * Section 1(발생량) 자동 누적 표시 + Section 2(재활용 위탁처리 증빙).
 * 조합별 대상 폐기물:
 *   - 항상: 생두 포장재·채프
 *   - 폐기까지: + 최소포장재·커피박
 *   - 환경성적표지 폐기까지: + 출하포장재 (수송은 산정 범위 미포함)
 *   - ISO 폐기까지: + 여과지(드립)
 * 처리 배출량은 결과 단계에서만 표시.
 */

interface Props {
  methodology?: Methodology;
  boundary?: Boundary;
}

export function Waste({ methodology = 'iso', boundary = 'grave' }: Props = {}) {
  const [hasProof, setHasProof] = useState(false);
  const grave = boundary === 'grave';
  const epd = methodology === 'epd';

  // source: 앞 단계 입력에서 누적된 값은 계산값, 문헌 원단위로 추정하는 값(채프·커피박·여과지)은 문헌값
  const allWasteItems: { name: string; note: string; where: string; source: DataSource; show: boolean }[] = [
    { name: '생두 포장재', note: '황마·PP 자루', where: '로스터리', source: 'calculated', show: true },
    { name: '채프', note: '로스팅 부산물', where: '로스터리', source: 'literature', show: true },
    { name: '최소포장재', note: '원두 봉투', where: '납품처', source: 'calculated', show: grave },
    { name: '출하포장재', note: '박스·테이프', where: '납품처', source: 'calculated', show: epd && grave },
    { name: '커피박', note: '추출 후 찌꺼기', where: '납품처', source: 'literature', show: grave },
    { name: '여과지', note: '드립 여과지', where: '납품처', source: 'literature', show: methodology === 'iso' && grave },
  ];
  const wasteItems = allWasteItems.filter((w) => w.show);

  return (
    <div className="space-y-4">
      {/* Section 1 — 폐기물 발생량 (자동) */}
      <SectionCard title="1. 폐기물 발생량" description="앞 단계의 데이터를 분석하여, 발생한 폐기물의 양을 자동으로 산정합니다.">
        <div className="divide-y divide-outline-variant overflow-hidden rounded-md border border-outline-variant">
          {wasteItems.map((it) => (
            <div key={it.name} className="flex items-center justify-between gap-3 bg-surface-container-lowest px-4 py-2.5 text-sm">
              <div className="min-w-0">
                <span className="font-medium text-on-surface">{it.name}</span>
                <span className="ml-1.5 text-xs text-on-surface-variant">· {it.note}</span>
                <span className="ml-1.5 text-xs text-on-surface-variant">· 발생 위치: {it.where}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <SourceBadge source={it.source} />
                <span className="tabular-nums text-on-surface-variant">— kg</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 2 — 폐기물 처리 방식 */}
      <SectionCard
        title="2. 폐기물 처리 방식"
        description="재활용 위탁처리 증빙이 있으면 해당 중량만큼 재활용분으로 인정하고, 그 외 폐기물은 국가 통계 비율을 적용하여 재활용·소각·매립처리됨을 가정하여 탄소발자국을 산정합니다."
      >
        <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-outline-variant p-3 hover:bg-surface-container-high">
          <input type="checkbox" checked={hasProof} onChange={(e) => setHasProof(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
          <span>
            <span className="block text-sm font-medium text-on-surface">재활용 위탁처리 증빙이 있습니다</span>
            <span className="mt-0.5 block text-xs text-on-surface-variant">재활용 처리한 폐기물의 명세서를 제출하면 그만큼 재활용으로 인정됩니다.</span>
          </span>
        </label>

        {hasProof && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="재활용 위탁처리 증빙서류" required hint="업로드한 문서에서 선택하거나 [업로드]로 새 증빙을 올립니다.">
              <DocPicker placeholder="증빙서류 선택" />
            </FormField>
            <FormField label="재활용 처리 폐기물 종류" required source="measured" sourceOcr>
              <Select
                options={[
                  { value: '', label: '선택' },
                  { value: 'box', label: '출하포장재 (박스)' },
                  { value: 'min', label: '최소포장재' },
                ]}
              />
            </FormField>
            <FormField label="재활용 처리 중량" required source="measured" sourceOcr hint={<OcrBadge text="증빙에서 자동 추출 · 발생량 초과분은 자동 제한" />}>
              <UnitInput unit="kg" type="number" placeholder="0" />
            </FormField>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-on-surface">잔여량 처리 비율 (국가 통계 자동 적용)</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <ReadonlyField label="재활용" value="20.02" unit="%" source="literature" help="환경부 「전국 폐기물 발생 및 처리현황」 공시 비율입니다." />
            <ReadonlyField label="소각" value="63.72" unit="%" source="literature" help="환경부 「전국 폐기물 발생 및 처리현황」 공시 비율입니다." />
            <ReadonlyField label="매립" value="16.27" unit="%" source="literature" help="환경부 「전국 폐기물 발생 및 처리현황」 공시 비율입니다." />
          </div>
        </div>
        <p className="text-xs text-on-surface-variant">
          처리 배출량은 마지막 <b className="font-medium text-on-surface">결과</b> 단계에서 계산되어 표시됩니다.
        </p>
      </SectionCard>

      {epd && (
        <InfoBanner>
          환경성적표지 방법론에서는 <b className="font-medium text-on-surface">폐기물 수송은 산정 범위에 포함되지 않으며</b>,
          폐기물 처리 배출량만 산정합니다.
        </InfoBanner>
      )}
    </div>
  );
}
