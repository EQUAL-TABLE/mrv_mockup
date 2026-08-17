/**
 * 단계별 배출량 막대 그래프 (MRV·계산기 결과 화면 공용).
 *
 * 항목 하나당 막대 하나. 제조전-원부자재 / 제조전-원료 수송처럼 세분화한 항목도 각각 독립된 막대로 둔다.
 * 비중(%)은 전체 합계 기준이다.
 */

export interface StageBarItem {
  name: string;
  value: number;
}

export function StageBars({ items }: { items: StageBarItem[] }) {
  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-3">
      {items.map((it) => {
        const pct = total > 0 ? (it.value / total) * 100 : 0;
        return (
          <div key={it.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-on-surface">{it.name}</span>
              <span className="tabular-nums font-medium text-on-surface">
                {it.value.toFixed(2)} <span className="text-xs text-on-surface-variant">({Math.round(pct)}%)</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
