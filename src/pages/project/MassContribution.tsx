import { Cpu } from 'lucide-react';
import { SectionCard } from '@/components/workspace/SectionCard';
import { InfoBanner } from '@/components/ui/form';
import type { Boundary, Methodology } from '@/types/project';
import { DEFAULT_PROJECT_DATA, beanListLabel } from '@/data/projectData';
import type { ProjectData } from '@/data/projectData';

/**
 * ⑤ 누적질량기여도 — MRV 공통(방법론·경계 분기).
 *
 * 전량 자동 산출·읽기전용. 컷오프 없음(100%).
 *   - ISO 14067: 단일 통합 테이블
 *   - 환경성적표지: 원료·보조물질 / 최소포장재 / 출하포장재 3개 테이블 분리(§4.2.2.3)
 * 대상 물질: 생두·최소포장재(항상), 출하포장재(환경성적표지 폐기까지), 여과지(ISO 드립 폐기까지).
 */

interface Props {
  methodology?: Methodology;
  boundary?: Boundary;
  data?: ProjectData;
}

interface Row {
  no: number;
  material: string;
  label: string;
  input: number; // kg/kg RC
}

interface MassTable {
  title: string;
  note?: string;
  rows: Row[];
}

export function MassContribution({ methodology = 'iso', boundary = 'grave', data = DEFAULT_PROJECT_DATA }: Props = {}) {
  const grave = boundary === 'grave';
  const epd = methodology === 'epd';
  const showBox = epd && grave;
  const showFilter = methodology === 'iso' && grave;

  const green: Row = { no: 1, material: '커피 생두', label: beanListLabel(data), input: data.mass.green };
  const minPack: Row = { no: 1, material: '복합 필름 포장재', label: data.minPackLabel, input: data.mass.minPack };
  const filter: Row = { no: 2, material: '크라프트지', label: '드립 여과지', input: data.mass.filter };
  const box: Row[] = [
    { no: 1, material: '골판지', label: '출하 박스', input: data.mass.box[0] },
    { no: 2, material: 'OPP 필름', label: '박스 테이프', input: data.mass.box[1] },
  ];

  // 환경성적표지: 3개 테이블 분리 / ISO: 단일 통합 테이블
  const tables: MassTable[] = epd
    ? [
        { title: '원료 · 보조물질', rows: [green] },
        { title: '최소포장재', rows: [minPack] },
        ...(showBox ? [{ title: '출하포장재', note: '환경성적표지 전용 · 별도 테이블로 분리 집계됩니다.', rows: box }] : []),
      ]
    : [
        {
          title: '전체 투입물',
          note: 'ISO 14067은 전 투입물을 단일 테이블로 통합 집계합니다.',
          rows: [green, minPack, ...(showFilter ? [filter] : [])].map((r, i) => ({ ...r, no: i + 1 })),
        },
      ];

  return (
    <div className="space-y-4">
      <InfoBanner>
        지금까지 등록한 재료가 최종 제품(원두 1kg)에서 각각 얼마나 차지하는지 자동으로 계산해 보여줍니다. 따로 입력할 것은
        없습니다.{' '}
        {epd ? (
          <b className="font-medium text-on-surface">환경성적표지는 원료·최소포장재·출하포장재를 3개 표로 나누어</b>
        ) : (
          <b className="font-medium text-on-surface">ISO 14067은 모든 투입물을 하나의 표로</b>
        )}{' '}
        집계하며, 누락 없이 100% 모두 반영합니다.
      </InfoBanner>

      {tables.map((t) => (
        <SectionCard key={t.title} title={t.title} description={t.note}>
          <MassTableView table={t} />
        </SectionCard>
      ))}

      <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm leading-relaxed text-on-surface-variant">
        <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          커피 로스터리의 투입물은 생두·포장재로 한정적이므로 누적질량기여도 기준을 100%로 설정하고 전 투입물을 산정에
          포함합니다. (ISO 14067 §6.4.5 민감도 분석 요건 충족)
        </span>
      </div>
    </div>
  );
}

function MassTableView({ table }: { table: MassTable }) {
  const total = table.rows.reduce((s, r) => s + r.input, 0);
  let cum = 0;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-outline-variant text-left text-xs text-on-surface-variant">
            <th className="py-2 pr-3 font-medium">No.</th>
            <th className="py-2 pr-3 font-medium">물질명</th>
            <th className="py-2 pr-3 font-medium">투입물 레이블</th>
            <th className="py-2 pr-3 text-right font-medium">투입량 (kg/kg)</th>
            <th className="py-2 pr-3 text-right font-medium">질량기여도</th>
            <th className="py-2 pr-3 text-right font-medium">누적기여도</th>
            <th className="py-2 font-medium">산정 포함</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/60">
          {table.rows.map((r) => {
            const share = (r.input / total) * 100;
            cum += share;
            return (
              <tr key={r.no} className="text-on-surface">
                <td className="py-2 pr-3 tabular-nums text-on-surface-variant">{r.no}</td>
                <td className="py-2 pr-3 font-medium">{r.material}</td>
                <td className="py-2 pr-3 text-on-surface-variant">{r.label}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{r.input.toFixed(4)}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{share.toFixed(1)}%</td>
                <td className="py-2 pr-3 text-right tabular-nums">{cum.toFixed(1)}%</td>
                <td className="py-2">
                  <span className="text-xs font-medium text-primary">포함</span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-outline-variant font-semibold text-on-surface">
            <td className="py-2 pr-3" colSpan={3}>
              소계
            </td>
            <td className="py-2 pr-3 text-right tabular-nums">{total.toFixed(4)}</td>
            <td className="py-2 pr-3 text-right tabular-nums">100.0%</td>
            <td className="py-2 pr-3" colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
