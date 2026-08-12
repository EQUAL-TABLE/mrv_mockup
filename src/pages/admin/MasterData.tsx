import { AlertTriangle, CheckCircle2, GitBranch, Info, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, CardTitle, Column, DataTable, MetaBadges, MetaFields, Modal, PageHeader, Pill, Tabs } from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';
import { FormField, InfoBanner, Select, TextInput } from '@/components/ui/form';
import {
  EfState,
  EF_STATE_LABEL,
  MASTER_DATA,
  MasterDatum,
  PACKAGING_MATERIALS,
  PackagingMaterial,
  VersionMeta,
  WASTE_CATEGORIES,
  WASTE_ITEMS,
  WASTE_RATIOS,
  WasteRatioRow,
  wasteCategoryName,
  wasteItemName,
} from '@/data/admin';

const STATE_TONE: Record<EfState, 'green' | 'amber' | 'gray'> = { active: 'green', pending: 'amber', archived: 'gray' };
const TODAY = '2026-08-12';

const TABS = [
  { key: 'common', label: '공통 기준 데이터' },
  { key: 'waste', label: '폐기물 처리 비율' },
  { key: 'packaging', label: '포장재 기준 데이터' },
];

// ─────────────────────────────────────────────────────────
type FormMode = 'create' | 'version' | 'edit';
interface CommonForm {
  category: string;
  name: string;
  value: string;
  unit: string;
  source: string;
  meta: VersionMeta;
}
const EMPTY_COMMON: CommonForm = { category: '', name: '', value: '', unit: '', source: '', meta: {} };

interface WasteForm {
  statYear: string;
  scope: 'category' | 'item';
  refId: string;
  incinerate: string;
  landfill: string;
  recycle: string;
  source: string;
}
const EMPTY_WASTE: WasteForm = { statYear: '', scope: 'category', refId: WASTE_CATEGORIES[0]?.id ?? '', incinerate: '', landfill: '', recycle: '', source: '' };

/** 성상/품목 refId → 표시명 */
const refLabel = (row: { scope: 'category' | 'item'; refId: string }) =>
  row.scope === 'category' ? wasteCategoryName(row.refId) : wasteItemName(row.refId);

export function MasterData() {
  const [tab, setTab] = useState('common');
  const [toast, setToast] = useState<string | null>(null);
  const idRef = useRef(3000);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  // ── 공통 기준 데이터 상태 ──
  const [common, setCommon] = useState<MasterDatum[]>(MASTER_DATA);
  const [cModal, setCModal] = useState<{ mode: FormMode; target?: MasterDatum } | null>(null);
  const [cForm, setCForm] = useState<CommonForm>(EMPTY_COMMON);
  const [cDelete, setCDelete] = useState<MasterDatum | null>(null);
  const categories = Array.from(new Set(common.map((d) => d.category)));

  const openCommon = (mode: FormMode, m?: MasterDatum) => {
    if (mode === 'create') setCForm({ ...EMPTY_COMMON, meta: { registeredAt: TODAY } });
    else if (mode === 'version' && m) setCForm({ category: m.category, name: m.name, value: '', unit: m.unit, source: '', meta: { registeredAt: TODAY } });
    else if (mode === 'edit' && m) setCForm({ category: m.category, name: m.name, value: m.value, unit: m.unit, source: m.source, meta: { ...m.meta } });
    setCModal({ mode, target: m });
  };
  const submitCommon = () => {
    if (!cModal) return;
    if (cModal.mode === 'edit' && cModal.target) {
      setCommon((rows) => rows.map((r) => (r.id === cModal.target!.id ? { ...r, value: cForm.value, unit: cForm.unit, source: cForm.source, updatedAt: TODAY, meta: cForm.meta } : r)));
      flash('값을 정정했습니다. (오류 정정 — 감사 로그 기록됨)');
    } else {
      const item: MasterDatum = { id: `m-${idRef.current++}`, category: cForm.category, name: cForm.name, value: cForm.value, unit: cForm.unit, source: cForm.source, updatedAt: TODAY, state: 'pending', meta: { ...cForm.meta, registeredAt: TODAY } };
      setCommon((rows) => [item, ...rows]);
      flash(cModal.mode === 'version' ? '새 버전을 "적용대기중"으로 저장했습니다. 기존 값은 병존합니다.' : '신규 항목을 "적용대기중"으로 저장했습니다.');
    }
    setCModal(null);
  };

  // ── 폐기물 처리 비율 상태 (연도별·성상별) ──
  const [waste, setWaste] = useState<WasteRatioRow[]>(WASTE_RATIOS);
  const [wModal, setWModal] = useState<{ mode: 'add' | 'edit'; target?: WasteRatioRow } | null>(null);
  const [wForm, setWForm] = useState<WasteForm>(EMPTY_WASTE);
  const [wDelete, setWDelete] = useState<WasteRatioRow | null>(null);

  const years = Array.from(new Set(waste.map((w) => w.statYear))).sort((a, b) => b - a);
  const latestYear = years[0];

  const openWaste = (mode: 'add' | 'edit', row?: WasteRatioRow) => {
    if (mode === 'add') setWForm(EMPTY_WASTE);
    else if (row) setWForm({ statYear: String(row.statYear), scope: row.scope, refId: row.refId, incinerate: String(row.incinerate), landfill: String(row.landfill), recycle: String(row.recycle), source: row.source });
    setWModal({ mode, target: row });
  };
  const wSum = Number(wForm.incinerate || 0) + Number(wForm.landfill || 0) + Number(wForm.recycle || 0);
  const wValid = Math.abs(wSum - 100) < 0.01;
  const submitWaste = () => {
    if (!wModal || !wValid) return;
    if (wModal.mode === 'edit' && wModal.target) {
      setWaste((rows) => rows.map((r) => (r.id === wModal.target!.id ? { ...r, statYear: Number(wForm.statYear), scope: wForm.scope, refId: wForm.refId, incinerate: Number(wForm.incinerate), landfill: Number(wForm.landfill), recycle: Number(wForm.recycle), source: wForm.source } : r)));
      flash('처리 비율을 정정했습니다. (감사 로그 기록됨)');
    } else {
      const item: WasteRatioRow = { id: `wr-${idRef.current++}`, statYear: Number(wForm.statYear), scope: wForm.scope, refId: wForm.refId, incinerate: Number(wForm.incinerate), landfill: Number(wForm.landfill), recycle: Number(wForm.recycle), source: wForm.source, registeredAt: TODAY };
      setWaste((rows) => [...rows, item]);
      flash(`${wForm.statYear}년 ${refLabel(item)} 처리 비율을 추가했습니다. 기존 연도는 병존 유지됩니다.`);
    }
    setWModal(null);
  };

  // ── 포장재 상태 ──
  const [pkgs, setPkgs] = useState<PackagingMaterial[]>(PACKAGING_MATERIALS);
  const [mModal, setMModal] = useState<{ pkgId: string; index: number | null } | null>(null);
  const [mForm, setMForm] = useState({ material: '', ratio: '', ef: '' });

  const openMaterial = (pkgId: string, index: number | null, existing?: { material: string; ratio: number; ef: number }) => {
    setMForm(existing ? { material: existing.material, ratio: String(existing.ratio), ef: String(existing.ef) } : { material: '', ratio: '', ef: '' });
    setMModal({ pkgId, index });
  };
  const submitMaterial = () => {
    if (!mModal) return;
    const entry = { material: mForm.material, ratio: Number(mForm.ratio), ef: Number(mForm.ef) };
    setPkgs((list) =>
      list.map((p) => {
        if (p.id !== mModal.pkgId) return p;
        const comp = [...p.composition];
        if (mModal.index === null) comp.push(entry);
        else comp[mModal.index] = entry;
        return { ...p, composition: comp };
      }),
    );
    flash(mModal.index === null ? '재질을 추가했습니다.' : '재질 구성을 정정했습니다.');
    setMModal(null);
  };
  const deleteMaterial = (pkgId: string, index: number) => {
    setPkgs((list) => list.map((p) => (p.id === pkgId ? { ...p, composition: p.composition.filter((_, i) => i !== index) } : p)));
    flash('재질을 삭제했습니다.');
  };

  // ─────────────────────────────────────────────────────────
  const commonColumns: Column<MasterDatum>[] = [
    { header: '분류', cell: (m) => <Pill tone="gray">{m.category}</Pill> },
    { header: '항목명', cell: (m) => <span className="font-medium text-on-surface">{m.name}</span> },
    { header: '적용연도 · 버전', cell: (m) => <MetaBadges meta={m.meta} /> },
    { header: '값', align: 'right', cell: (m) => <span className="font-mono text-on-surface">{m.value} <span className="text-xs text-on-surface-variant">{m.unit}</span></span> },
    { header: '출처', cell: (m) => <span className="text-xs text-on-surface-variant">{m.source}</span> },
    { header: '상태', cell: (m) => <Pill tone={STATE_TONE[m.state]}>{EF_STATE_LABEL[m.state]}</Pill> },
    {
      header: '관리',
      align: 'right',
      cell: (m) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => openCommon('version', m)} className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10" title="새 값 추가 (기존 병존)">
            <GitBranch className="h-3.5 w-3.5" /> 새 버전
          </button>
          <button type="button" onClick={() => openCommon('edit', m)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-surface-container-high" title="입력 오류 정정">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setCDelete(m)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-error/10 hover:text-error" title="입력 오류 삭제">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const cModalTitle = cModal?.mode === 'create' ? '신규 항목 등록' : cModal?.mode === 'version' ? '새 버전 등록' : '값 정정 (입력 오류 수정)';

  return (
    <AdminShell>
      <PageHeader
        title="기준 데이터 관리"
        description="시스템 전반 공통 기준 데이터를 조회·등록·수정합니다. 연도/버전이 다른 값은 병존하며, 매칭 로직이 메타를 참고해 최적 값을 선택합니다."
        actions={
          tab === 'common' ? (
            <Button size="sm" onClick={() => openCommon('create')}>
              <Plus className="h-4 w-4" /> 신규 항목 등록
            </Button>
          ) : tab === 'waste' ? (
            <Button size="sm" onClick={() => openWaste('add')}>
              <Plus className="h-4 w-4" /> 연도/성상 통계 추가
            </Button>
          ) : undefined
        }
      />

      <InfoBanner>
        값 변경 시 기존을 덮어쓰지 않고 <b className="font-semibold text-on-surface">&quot;새 버전/새 연도&quot;로 추가</b>하는 것을
        권장합니다(연도별 병존·이력 보존). <b className="font-semibold text-on-surface">정정·삭제</b>는 관리자가 잘못 입력한
        데이터를 바로잡는 용도로만 사용하세요. 폐기물 처리 비율은 성상별로 소각·매립·재활용 합계 100% 검증을 병행합니다.
      </InfoBanner>

      <div className="mt-4">
        <Tabs items={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="mt-5">
        {/* ── 공통 기준 데이터 ── */}
        {tab === 'common' && (
          <Card>
            <CardTitle title="공통 기준 데이터" sub="로스팅 수율·커피박 함수율·채프계수·NCV·가스 환산계수·사용단계 전력 원단위 등" />
            <DataTable columns={commonColumns} rows={common} rowKey={(m) => m.id} />
          </Card>
        )}

        {/* ── 폐기물 처리 비율 (연도별·성상별) ── */}
        {tab === 'waste' && (
          <div className="space-y-5">
            {years.map((year) => {
              const rows = waste.filter((w) => w.statYear === year);
              return (
                <Card key={year}>
                  <CardTitle
                    title={`${year}년 통계`}
                    sub={rows[0]?.source}
                    actions={year === latestYear ? <Pill tone="green">최신 적용</Pill> : <Pill tone="gray">과거(연도별 병존)</Pill>}
                  />
                  <DataTable
                    rowKey={(r) => r.id}
                    rows={rows}
                    columns={[
                      {
                        header: '적용 단위 (성상/품목)',
                        cell: (r) => (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-on-surface">{refLabel(r)}</span>
                            {r.scope === 'category' ? <Pill tone="gray">성상</Pill> : <Pill tone="amber">품목 override</Pill>}
                          </div>
                        ),
                      },
                      { header: '소각', align: 'right', cell: (r) => `${r.incinerate}%` },
                      { header: '매립', align: 'right', cell: (r) => `${r.landfill}%` },
                      { header: '재활용', align: 'right', cell: (r) => `${r.recycle}%` },
                      {
                        header: '합계',
                        align: 'right',
                        cell: (r) => {
                          const sum = r.incinerate + r.landfill + r.recycle;
                          const ok = Math.abs(sum - 100) < 0.01;
                          return ok ? <Pill tone="green">100%</Pill> : <Pill tone="red">{sum.toFixed(2)}%</Pill>;
                        },
                      },
                      {
                        header: '관리',
                        align: 'right',
                        cell: (r) => (
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" onClick={() => openWaste('edit', r)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-surface-container-high" title="정정">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => setWDelete(r)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-error/10 hover:text-error" title="삭제">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ),
                      },
                    ]}
                  />
                </Card>
              );
            })}
          </div>
        )}

        {/* ── 포장재 ── */}
        {tab === 'packaging' && (
          <div className="space-y-5">
            {pkgs.map((pkg) => {
              const sum = pkg.composition.reduce((s, c) => s + c.ratio, 0);
              const ok = Math.abs(sum - 100) < 0.01;
              return (
                <Card key={pkg.id}>
                  <CardTitle
                    title={pkg.name}
                    sub={`${pkg.source} · 환경성적표지 기준`}
                    actions={
                      <div className="flex items-center gap-2">
                        <MetaBadges meta={pkg.meta} />
                        {ok ? <Pill tone="green">합계 100%</Pill> : <Pill tone="red">합계 {sum.toFixed(1)}%</Pill>}
                        <Button variant="secondary" size="sm" onClick={() => openMaterial(pkg.id, null)}>
                          <Plus className="h-3.5 w-3.5" /> 재질 추가
                        </Button>
                      </div>
                    }
                  />
                  <DataTable
                    rowKey={(c) => c.material}
                    rows={pkg.composition}
                    columns={[
                      { header: '재질', cell: (c) => <span className="font-medium text-on-surface">{c.material}</span> },
                      { header: '구성비율', align: 'right', cell: (c) => `${c.ratio}%` },
                      { header: '재질별 EF', align: 'right', cell: (c) => <span className="font-mono">{c.ef} <span className="text-xs text-on-surface-variant">kg CO2e/kg</span></span> },
                      {
                        header: '관리',
                        align: 'right',
                        cell: (c) => {
                          const idx = pkg.composition.indexOf(c);
                          return (
                            <div className="flex items-center justify-end gap-1">
                              <button type="button" onClick={() => openMaterial(pkg.id, idx, c)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-surface-container-high" title="정정">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button type="button" onClick={() => deleteMaterial(pkg.id, idx)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-error/10 hover:text-error" title="삭제">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          );
                        },
                      },
                    ]}
                  />
                  {!ok && (
                    <p className="flex items-center gap-1.5 border-t border-outline-variant px-5 py-3 text-xs font-semibold text-error">
                      <AlertTriangle className="h-3.5 w-3.5" /> 재질 구성비율 합계가 100%가 아니면 저장할 수 없습니다.
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 공통 데이터 폼 모달 ── */}
      <Modal
        open={!!cModal}
        onClose={() => setCModal(null)}
        title={cModalTitle}
        wide
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setCModal(null)}>취소</Button>
            <Button size="sm" onClick={submitCommon} disabled={!cForm.name || !cForm.value || !cForm.unit}>
              {cModal?.mode === 'edit' ? '정정 확정' : '등록 확정'}
            </Button>
          </>
        }
      >
        {cModal?.mode === 'version' && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm leading-relaxed text-on-surface">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>기존 값 <b>{cModal.target?.value} {cModal.target?.unit}</b>은 유지·병존하고, 새 값이 &quot;적용대기중&quot;으로 추가됩니다.</span>
          </div>
        )}
        {cModal?.mode === 'edit' && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>정정은 <b>기존 값 덮어쓰기(오류 수정) 전용</b>입니다. 새 값 반영은 &quot;새 버전&quot;을 사용하세요.</span>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="분류" required>
            <TextInput value={cForm.category} onChange={(e) => setCForm((f) => ({ ...f, category: e.target.value }))} disabled={cModal?.mode !== 'create'} placeholder="예: 로스팅 / 에너지" list="mcats" />
            <datalist id="mcats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </FormField>
          <FormField label="항목명" required>
            <TextInput value={cForm.name} onChange={(e) => setCForm((f) => ({ ...f, name: e.target.value }))} disabled={cModal?.mode !== 'create'} placeholder="예: 로스팅 수율" />
          </FormField>
          <FormField label="값" required>
            <TextInput value={cForm.value} onChange={(e) => setCForm((f) => ({ ...f, value: e.target.value }))} placeholder="예: 82" />
          </FormField>
          <FormField label="단위" required>
            <TextInput value={cForm.unit} onChange={(e) => setCForm((f) => ({ ...f, unit: e.target.value }))} placeholder="예: %" />
          </FormField>
          <FormField label="출처" required className="sm:col-span-2">
            <TextInput value={cForm.source} onChange={(e) => setCForm((f) => ({ ...f, source: e.target.value }))} placeholder="예: 문헌값 (2024)" />
          </FormField>
        </div>
        <div className="mt-4">
          <MetaFields meta={cForm.meta} onChange={(patch) => setCForm((f) => ({ ...f, meta: { ...f.meta, ...patch } }))} />
        </div>
      </Modal>

      {/* 공통 삭제 */}
      <Modal open={!!cDelete} onClose={() => setCDelete(null)} title="항목 삭제" footer={<><Button variant="secondary" size="sm" onClick={() => setCDelete(null)}>취소</Button><Button size="sm" className="bg-error hover:bg-error/90" onClick={() => { setCommon((r) => r.filter((x) => x.id !== cDelete!.id)); flash('항목을 삭제했습니다.'); setCDelete(null); }}>삭제 확정</Button></>}>
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span><b>{cDelete?.name}</b> 항목을 삭제합니다. 잘못 등록한 데이터 정정 용도로만 사용하세요. (감사 로그 기록됨)</span>
        </div>
      </Modal>

      {/* ── 폐기물 처리 비율 폼 모달 ── */}
      <Modal
        open={!!wModal}
        onClose={() => setWModal(null)}
        title={wModal?.mode === 'add' ? '연도/성상 처리 비율 추가' : '처리 비율 정정'}
        wide
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setWModal(null)}>취소</Button>
            <Button size="sm" onClick={submitWaste} disabled={!wValid || !wForm.statYear || !wForm.refId}>
              {wModal?.mode === 'add' ? '추가' : '정정 확정'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="적용 기준연도 (stat_year)" required>
            <TextInput type="number" value={wForm.statYear} onChange={(e) => setWForm((f) => ({ ...f, statYear: e.target.value }))} placeholder="예: 2025" />
          </FormField>
          <FormField label="적용 단위" required help="기본은 성상 단위. 특정 품목만 별도 통계를 쓸 때 '품목 override'.">
            <Select
              value={wForm.scope}
              onChange={(e) => {
                const scope = e.target.value as 'category' | 'item';
                setWForm((f) => ({ ...f, scope, refId: scope === 'category' ? WASTE_CATEGORIES[0]?.id ?? '' : WASTE_ITEMS[0]?.id ?? '' }));
              }}
              options={[
                { value: 'category', label: '성상 단위 (기본)' },
                { value: 'item', label: '품목 override' },
              ]}
            />
          </FormField>
          <FormField label={wForm.scope === 'category' ? '성상 선택' : '품목 선택'} required className="sm:col-span-2" help="자유 입력이 아닌 마스터에서 선택합니다. 목록은 '물질·매핑 데이터'에서 관리.">
            <Select
              value={wForm.refId}
              onChange={(e) => setWForm((f) => ({ ...f, refId: e.target.value }))}
              options={(wForm.scope === 'category' ? WASTE_CATEGORIES.map((c) => ({ value: c.id, label: c.name })) : WASTE_ITEMS.map((w) => ({ value: w.id, label: w.name })))}
            />
          </FormField>
          <FormField label="소각 %" required>
            <TextInput type="number" value={wForm.incinerate} onChange={(e) => setWForm((f) => ({ ...f, incinerate: e.target.value }))} placeholder="0" />
          </FormField>
          <FormField label="매립 %" required>
            <TextInput type="number" value={wForm.landfill} onChange={(e) => setWForm((f) => ({ ...f, landfill: e.target.value }))} placeholder="0" />
          </FormField>
          <FormField label="재활용 %" required>
            <TextInput type="number" value={wForm.recycle} onChange={(e) => setWForm((f) => ({ ...f, recycle: e.target.value }))} placeholder="0" />
          </FormField>
          <FormField label="출처" className="sm:col-span-2">
            <TextInput value={wForm.source} onChange={(e) => setWForm((f) => ({ ...f, source: e.target.value }))} placeholder="예: 환경부 전국 폐기물 발생 및 처리현황 2025" />
          </FormField>
        </div>
        <div className={`mt-4 flex items-center gap-2 rounded-md border p-3 text-sm font-semibold ${wValid ? 'border-primary/40 bg-primary/5 text-primary' : 'border-error/40 bg-error/5 text-error'}`}>
          {wValid ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          소각+매립+재활용 = {wSum.toFixed(2)}% {wValid ? '· 검증 통과' : '· 100%가 되어야 저장 가능'}
        </div>
      </Modal>

      {/* 폐기물 비율 삭제 */}
      <Modal open={!!wDelete} onClose={() => setWDelete(null)} title="처리 비율 삭제" footer={<><Button variant="secondary" size="sm" onClick={() => setWDelete(null)}>취소</Button><Button size="sm" className="bg-error hover:bg-error/90" onClick={() => { setWaste((r) => r.filter((x) => x.id !== wDelete!.id)); flash('처리 비율 행을 삭제했습니다.'); setWDelete(null); }}>삭제 확정</Button></>}>
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span><b>{wDelete?.statYear}년 {wDelete && refLabel(wDelete)}</b> 행을 삭제합니다. 과거 연도 통계는 해당 연도 프로젝트 매칭에 쓰이므로, 잘못 입력한 경우에만 삭제하세요.</span>
        </div>
      </Modal>

      {/* ── 포장재 재질 폼 모달 ── */}
      <Modal
        open={!!mModal}
        onClose={() => setMModal(null)}
        title={mModal?.index === null ? '재질 추가' : '재질 구성 정정'}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setMModal(null)}>취소</Button>
            <Button size="sm" onClick={submitMaterial} disabled={!mForm.material || !mForm.ratio || !mForm.ef}>저장</Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormField label="재질명" required>
            <TextInput value={mForm.material} onChange={(e) => setMForm((f) => ({ ...f, material: e.target.value }))} placeholder="예: LDPE" />
          </FormField>
          <FormField label="구성비율 (%)" required>
            <TextInput type="number" value={mForm.ratio} onChange={(e) => setMForm((f) => ({ ...f, ratio: e.target.value }))} placeholder="예: 44" />
          </FormField>
          <FormField label="재질별 EF (kg CO2e/kg)" required>
            <TextInput type="number" value={mForm.ef} onChange={(e) => setMForm((f) => ({ ...f, ef: e.target.value }))} placeholder="예: 1.73" />
          </FormField>
          <p className="text-xs text-on-surface-variant">저장 후 상단 카드에서 구성비율 합계 100% 여부가 즉시 검증됩니다.</p>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[min(90vw,36rem)] -translate-x-1/2 rounded-md bg-on-surface px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </AdminShell>
  );
}
