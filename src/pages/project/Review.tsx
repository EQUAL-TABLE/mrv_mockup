import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { SectionCard } from '@/components/workspace/SectionCard';
import type { Methodology } from '@/types/project';

/**
 * ⑪ 검토단계 — MRV 공통.
 *
 * 전 화면 입력값을 대상으로 6개 그룹·판정 항목을 일괄 점검한다.
 * 화면 구조(6그룹·결과 패널·확정 버튼)는 방법론·경계와 무관하게 동일하며,
 * 항목 22(출하포장재 ↔ 환경성적표지 선택 일치)만 환경성적표지 전용 판정이라 그 외에는 제외된다.
 * 오류 0건 + 경고 전체 확인 시 하단 [확정] 버튼이 활성화된다.
 */

interface Props {
  methodology?: Methodology;
}

type Verdict = 'ok' | 'warn' | 'error';

interface Item {
  no: number;
  label: string;
  verdict: Verdict;
  /** 경고/오류 상세 */
  detail?: string;
}

interface Group {
  title: string;
  items: Item[];
}

/** 데모용 판정 결과 (오류 0건 · 경고 3건) */
const GROUPS: Group[] = [
  {
    title: '그룹 1 · 기간 정합성',
    items: [
      { no: 1, label: '전력 고지서 발급월이 수집 기간에 포함되는지', verdict: 'ok' },
      { no: 2, label: '가스 고지서 발급월이 수집 기간에 포함되는지', verdict: 'ok' },
      { no: 3, label: '재생에너지 발전량 기록 연월이 수집 기간에 포함되는지', verdict: 'ok' },
      { no: 4, label: '재활용 위탁처리 명세서 발행일이 수집 기간에 포함되는지', verdict: 'ok' },
      { no: 5, label: '생두 INVOICE 발행일과 B/L 발행일이 근접한지', verdict: 'warn', detail: '두 문서 발행일 차이가 30일을 초과합니다. 확인 후 진행하세요.' },
    ],
  },
  {
    title: '그룹 2 · 필수 항목 존재 여부',
    items: [
      { no: 6, label: '생두 INVOICE 업로드', verdict: 'ok' },
      { no: 7, label: '전력 고지서 업로드', verdict: 'ok' },
      { no: 8, label: '가스 고지서 업로드 ↔ 연료 유형(전력+가스) 일치', verdict: 'ok' },
      { no: 9, label: '재생에너지 설치 확인서 ↔ 재생에너지 사용 선택 일치', verdict: 'ok' },
    ],
  },
  {
    title: '그룹 3 · 데이터 매칭 및 품질',
    items: [
      { no: 10, label: '원료 매칭(DB 매핑) 완료 여부', verdict: 'ok' },
      { no: 11, label: '문헌값(이차 데이터) 적용 구간 존재', verdict: 'warn', detail: '농장 탄소배출 증빙이 없어 생두 배출량에 문헌값(1.165)을 적용했습니다.' },
      { no: 12, label: 'OCR 실패로 수동 입력한 항목 존재', verdict: 'ok' },
    ],
  },
  {
    title: '그룹 4 · 수량 정합성',
    items: [
      { no: 13, label: '농장별 INVOICE 거래량 합계 ≥ 생두 투입량', verdict: 'ok' },
      { no: 14, label: 'INVOICE 거래량 ↔ B/L 수송량 괴리(±5%)', verdict: 'ok' },
      { no: 15, label: '제품유통 수송량이 생산량을 초과하지 않는지', verdict: 'ok' },
      { no: 16, label: '블렌딩 비율 합계 100%', verdict: 'ok' },
      { no: 23, label: '재활용 처리 중량이 발생량을 초과하지 않는지', verdict: 'ok' },
      { no: 24, label: '재활용 증빙서류 내 품목 명시 여부', verdict: 'ok' },
    ],
  },
  {
    title: '그룹 5 · 주소 정합성',
    items: [
      { no: 17, label: '로스터리 주소 ↔ 수입국 내륙수송 도착지 시군구 일치', verdict: 'ok' },
      { no: 18, label: '로스터리 주소 ↔ 제품유통 출발지 시군구 일치', verdict: 'ok' },
      { no: 19, label: '농장 주소 ↔ 수출국 내륙수송 출발지 시군구 일치', verdict: 'warn', detail: '농장 주소와 수출국 내륙수송 출발지의 시군구가 다릅니다. 확인 후 진행하세요.' },
      { no: 20, label: '납품처 주소 ↔ 제품유통 도착지 시군구 일치', verdict: 'ok' },
    ],
  },
  {
    title: '그룹 6 · 기타 정합성',
    items: [
      { no: 21, label: '농장 탄소배출 증빙 기준년도 ↔ 프로젝트 기준년도 일치', verdict: 'ok' },
      { no: 22, label: '출하포장재 입력 ↔ 환경성적표지 선택 일치', verdict: 'ok' },
    ],
  },
];

export function Review({ methodology = 'iso' }: Props = {}) {
  // 항목 22는 환경성적표지 전용 판정 → 그 외 방법론에서는 제외
  const groups = GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((it) => it.no !== 22 || methodology === 'epd'),
  }));
  const warnItems = groups.flatMap((g) => g.items).filter((i) => i.verdict === 'warn');
  const errorCount = groups.flatMap((g) => g.items).filter((i) => i.verdict === 'error').length;
  const [checked, setChecked] = useState<number[]>([]);
  const toggle = (no: number) => setChecked((p) => (p.includes(no) ? p.filter((x) => x !== no) : [...p, no]));

  const allWarnChecked = warnItems.every((i) => checked.includes(i.no));
  const canFinalize = errorCount === 0 && allWarnChecked;

  return (
    <div className="space-y-4">
      {/* 요약 */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile label="오류" count={errorCount} tone="error" hint="수정해야 확정 가능" />
        <SummaryTile label="경고" count={warnItems.length} tone="warn" hint="확인 후 진행 가능" />
        <SummaryTile label="정상" count={groups.flatMap((g) => g.items).length - warnItems.length - errorCount} tone="ok" />
      </div>

      {groups.map((g) => (
        <SectionCard key={g.title} title={g.title}>
          <div className="divide-y divide-outline-variant overflow-hidden rounded-md border border-outline-variant">
            {g.items.map((it) => (
              <ItemRow key={it.no} item={it} checked={checked.includes(it.no)} onToggle={() => toggle(it.no)} />
            ))}
          </div>
        </SectionCard>
      ))}

      {/* 확정 안내 */}
      <div
        className={`rounded-lg border p-4 text-sm ${
          canFinalize ? 'border-primary/30 bg-primary/5 text-on-surface' : 'border-warning/40 bg-warning/5 text-warning'
        }`}
      >
        {canFinalize
          ? '오류가 없고 모든 경고를 확인했습니다. 하단 [확정] 버튼으로 결과를 확정할 수 있습니다. (확정 시 데이터가 잠깁니다)'
          : `확정하려면 오류 ${errorCount}건을 수정하고, 경고 ${warnItems.length}건을 모두 확인해야 합니다. (확인 ${checked.filter((n) => warnItems.some((w) => w.no === n)).length}/${warnItems.length})`}
      </div>
    </div>
  );
}

function SummaryTile({ label, count, tone, hint }: { label: string; count: number; tone: Verdict; hint?: string }) {
  const color = tone === 'error' ? 'text-error' : tone === 'warn' ? 'text-warning' : 'text-primary';
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <p className="text-xs font-medium text-on-surface-variant">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{count}</p>
      {hint && <p className="mt-0.5 text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}

function ItemRow({ item, checked, onToggle }: { item: Item; checked: boolean; onToggle: () => void }) {
  const cfg = {
    ok: { Icon: CheckCircle2, cls: 'text-primary', label: '정상' },
    warn: { Icon: AlertTriangle, cls: 'text-warning', label: '경고' },
    error: { Icon: XCircle, cls: 'text-error', label: '오류' },
  }[item.verdict];

  return (
    <div className="bg-surface-container-lowest px-4 py-3">
      <div className="flex items-start gap-3">
        <cfg.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.cls}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs tabular-nums text-on-surface-variant">#{item.no}</span>
            <span className="text-sm text-on-surface">{item.label}</span>
            <span className={`text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
          </div>
          {item.detail && <p className="mt-1 text-xs text-on-surface-variant">{item.detail}</p>}

          {item.verdict === 'warn' && (
            <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-on-surface">
              <input type="checkbox" checked={checked} onChange={onToggle} className="h-3.5 w-3.5 accent-primary" />
              내용을 확인했습니다
            </label>
          )}
          {(item.verdict === 'error' || item.verdict === 'warn') && (
            <button
              type="button"
              onClick={() => alert('해당 입력 화면으로 이동 (목업)')}
              className="ml-3 text-xs font-semibold text-primary hover:underline"
            >
              해당 화면으로 이동
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
