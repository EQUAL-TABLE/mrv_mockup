import { Download, FileCheck2, FileText, History } from 'lucide-react';
import type { ComponentType } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import { ReadonlyField } from '@/components/ui/form';
import { DEFAULT_PROJECT_DATA } from '@/data/projectData';
import type { ProjectData } from '@/data/projectData';
import type { Boundary, Methodology } from '@/types/project';

/**
 * ⑫ 결과 — MRV 공통(방법론·경계 분기).
 *
 * 배출량이 최초로 표시되는 화면. 조합별 단계 구성:
 *   - ISO 제품 생산까지: 제조전 · 제조 · 폐기수송 · 폐기처리
 *   - ISO 폐기까지: 제조전 · 제조 · 제품유통 · 사용 · 폐기수송 · 폐기처리
 *   - 환경성적표지 폐기까지: 제조전 · 제조 · 제품유통 · 폐기처리 (사용·폐기수송 없음)
 * Section 3(데이터 출처 등급)·Section 4(보고서 발행)는 MRV 전용.
 */

interface Props {
  methodology?: Methodology;
  boundary?: Boundary;
  data?: ProjectData;
}

export function Result({ methodology = 'iso', boundary = 'grave', data = DEFAULT_PROJECT_DATA }: Props = {}) {
  const grave = boundary === 'grave';
  const iso = methodology === 'iso';

  const st = data.result.stages;
  const raw = [
    { name: '제조 전 (원료·수송)', value: st.pre, show: true },
    { name: '제조 (로스팅)', value: st.manuf, show: true },
    { name: '제품 유통', value: st.distribution, show: grave },
    { name: '사용', value: st.usage, show: iso && grave },
    { name: '폐기 수송', value: st.wasteTransport, show: iso },
    { name: '폐기 처리', value: st.waste, show: true },
  ].filter((s) => s.show);
  const total = raw.reduce((s, r) => s + r.value, 0);
  const stages = raw.map((s) => ({ ...s, pct: Math.round((s.value / total) * 100) }));

  return (
    <div className="space-y-4">
      {/* Section 1 — 단계별 배출량 */}
      <SectionCard title="단계별 탄소배출량" description="단위: kg CO₂e / 원두 1kg">
        <div className="space-y-3">
          {stages.map((s) => (
            <div key={s.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-on-surface">{s.name}</span>
                <span className="tabular-nums font-medium text-on-surface">
                  {s.value.toFixed(2)} <span className="text-xs text-on-surface-variant">({s.pct}%)</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full rounded-full bg-primary" style={{ width: `${s.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 2 — 최종 탄소발자국 */}
      <SectionCard title="최종 탄소발자국">
        <div className="rounded-md border border-primary/30 bg-primary/5 p-5">
          <p className="text-sm text-on-surface-variant">탄소발자국 (원두 1kg 기준)</p>
          <p className="mt-1">
            <span className="text-3xl font-bold tabular-nums text-primary">{total.toFixed(2)}</span>{' '}
            <span className="text-sm font-medium text-on-surface-variant">kg CO₂e/kg</span>
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ReadonlyField label="Scope 1 (직접 연소)" value={data.result.scope.s1.toFixed(2)} unit="kg CO₂e/kg" help="우리 로스터리에서 가스를 직접 태워 나온 배출량입니다. 배출을 어디서 냈는지 나눠 보는 참고용 분류예요." />
          <ReadonlyField label="Scope 2 (구매 전력)" value={data.result.scope.s2.toFixed(2)} unit="kg CO₂e/kg" help="외부에서 사서 쓴 전기 때문에 나온 배출량입니다. 태양광 등 직접 만든 전기는 빼고 계산합니다. 참고용 분류예요." />
          <ReadonlyField label="Scope 3 (그 외)" value={data.result.scope.s3.toFixed(2)} unit="kg CO₂e/kg" help="그 밖에 생두·수송·포장재·폐기 등에서 나온 배출량을 모두 합한 값입니다. 참고용 분류예요." />
        </div>
      </SectionCard>

      {/* Section 3 — 데이터 출처 등급 요약 */}
      <SectionCard title="데이터 출처 등급 요약" description="어떤 값이 실측·계산·추정으로 산정됐는지 보여줍니다.">
        <div className="grid gap-3 sm:grid-cols-3">
          <ReadonlyField label="측정치 기반" value="전력·가스·거래량 등" />
          <ReadonlyField label="계산치 기반" value="수송량·포장재 사용량 등" />
          <ReadonlyField label="추정치(문헌값) 적용" value="생두 배출량(1.165) 등" />
        </div>
        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-xs leading-relaxed text-on-surface-variant">
          문헌값 적용 구간과 OCR 수동 입력 대체 항목은 보고서 본문에 자동으로 기재됩니다.
        </div>
      </SectionCard>

      {/* Section 4 — 보고서 발행 */}
      <SectionCard title="보고서 발행" description="확정된 프로젝트의 결과 문서를 발급합니다. 재발행 시 최초 확정 시점의 배출계수를 그대로 사용합니다.">
        <div className="grid gap-2 sm:grid-cols-3">
          <ReportButton Icon={FileCheck2} label="결과확인서 발행" />
          <ReportButton Icon={FileText} label="결과보고서 발행" />
          <ReportButton Icon={History} label="감사로그 (수정 이력)" secondary />
        </div>
      </SectionCard>
    </div>
  );
}

function ReportButton({
  Icon,
  label,
  secondary,
}: {
  Icon: ComponentType<{ className?: string }>;
  label: string;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => alert(`${label} (목업)`)}
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
        secondary
          ? 'border-outline-variant text-on-surface hover:bg-surface-container-high'
          : 'border-primary bg-primary text-white hover:bg-primary/90'
      }`}
    >
      {secondary ? <Icon className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      {label}
    </button>
  );
}
