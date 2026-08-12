import { AlertTriangle, GitBranch, History, Info, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, Column, DataTable, FilterBar, MetaBadges, MetaFields, Modal, PageHeader, Pill } from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';
import { FormField, InfoBanner, Select, TextInput } from '@/components/ui/form';
import {
  DQI_CRITERIA,
  EF_GWP_LABEL,
  EF_STAGE_LABEL,
  EF_STANDARD_LABEL,
  EF_STATE_LABEL,
  EMISSION_FACTORS,
  EfState,
  EmissionFactor,
  VersionMeta,
} from '@/data/admin';

const STATE_TONE: Record<EfState, 'green' | 'amber' | 'gray'> = { active: 'green', pending: 'amber', archived: 'gray' };

type FormMode = 'create' | 'version' | 'edit';
interface EfForm {
  name: string;
  stage: string;
  standard: string;
  value: string;
  unit: string;
  source: string;
  meta: VersionMeta;
}
const EMPTY: EfForm = { name: '', stage: 'material', standard: 'iso', value: '', unit: '', source: '', meta: {} };
const TODAY = '2026-08-12';

/** 배출계수(EF) 관리 — 연도·버전 메타 노출 + 신규 추가 위주 CRUD */
export function Factors() {
  const navigate = useNavigate();
  const [data, setData] = useState<EmissionFactor[]>(EMISSION_FACTORS);
  const [stage, setStage] = useState('all');
  const [standard, setStandard] = useState('all');
  const [state, setState] = useState('all');
  const [modal, setModal] = useState<{ mode: FormMode; target?: EmissionFactor } | null>(null);
  const [form, setForm] = useState<EfForm>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<EmissionFactor | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const idRef = useRef(2000);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  const rows = data.filter(
    (e) =>
      (stage === 'all' || e.stage === stage) &&
      (standard === 'all' || e.standard === standard) &&
      (state === 'all' || e.state === state),
  );

  // 동일 항목명 그룹에서 적용연도가 가장 높은 활성 레코드 = "최신"
  const latestIds = new Set<string>();
  const byName = new Map<string, EmissionFactor[]>();
  data.forEach((e) => byName.set(e.name, [...(byName.get(e.name) ?? []), e]));
  byName.forEach((group) => {
    const withYear = group.filter((g) => g.state === 'active' && g.meta?.effectiveYear);
    if (withYear.length > 1) {
      const top = withYear.reduce((a, b) => (Number(a.meta!.effectiveYear) >= Number(b.meta!.effectiveYear) ? a : b));
      latestIds.add(top.id);
    }
  });

  const openCreate = () => {
    setForm({ ...EMPTY, meta: { registeredAt: TODAY } });
    setModal({ mode: 'create' });
  };
  const openVersion = (e: EmissionFactor) => {
    setForm({
      name: e.name,
      stage: e.stage,
      standard: e.standard,
      value: '',
      unit: e.unit,
      source: '',
      meta: { registeredAt: TODAY },
    });
    setModal({ mode: 'version', target: e });
  };
  const openEdit = (e: EmissionFactor) => {
    setForm({
      name: e.name,
      stage: e.stage,
      standard: e.standard,
      value: String(e.value),
      unit: e.unit,
      source: e.source,
      meta: { ...e.meta },
    });
    setModal({ mode: 'edit', target: e });
  };

  const submit = () => {
    if (!modal) return;
    if (modal.mode === 'edit' && modal.target) {
      setData((rows) =>
        rows.map((r) =>
          r.id === modal.target!.id
            ? { ...r, value: Number(form.value), unit: form.unit, source: form.source, updatedAt: TODAY, meta: form.meta }
            : r,
        ),
      );
      flash('값을 정정했습니다. (관리자 입력 오류 정정 — 감사 로그 기록됨)');
    } else {
      const item: EmissionFactor = {
        id: `ef-new-${idRef.current++}`,
        name: form.name,
        stage: form.stage as EmissionFactor['stage'],
        standard: form.standard as EmissionFactor['standard'],
        value: Number(form.value),
        unit: form.unit,
        source: form.source,
        version: modal.mode === 'version' ? `${modal.target?.version ?? 'v'}+` : 'v1',
        updatedAt: TODAY,
        updatedBy: 'admin',
        dqi: 2.0,
        state: 'pending',
        meta: { ...form.meta, registeredAt: TODAY },
      };
      setData((rows) => [item, ...rows]);
      flash(
        modal.mode === 'version'
          ? '새 버전을 "적용대기중"으로 저장했습니다. 기존 연도/버전 레코드는 그대로 유지되어 병존합니다.'
          : '신규 배출계수를 "적용대기중"으로 저장했습니다. 적용시작일 도래 시 자동 전환됩니다.',
      );
    }
    setModal(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setData((rows) => rows.filter((r) => r.id !== deleteTarget.id));
    flash('배출계수를 삭제했습니다. (관리자 입력 오류 정정 — 감사 로그 기록됨)');
    setDeleteTarget(null);
  };

  const columns: Column<EmissionFactor>[] = [
    {
      header: '항목명',
      cell: (e) => (
        <div>
          <p className="font-medium text-on-surface">{e.name}</p>
          <p className="text-xs text-on-surface-variant">
            {EF_STAGE_LABEL[e.stage]}
            {e.computed && ' · 자동 계산값'}
          </p>
        </div>
      ),
    },
    {
      header: '적용연도 · 버전',
      cell: (e) => <MetaBadges meta={e.meta} latest={latestIds.has(e.id)} />,
    },
    {
      header: '값',
      align: 'right',
      cell: (e) => (
        <span className="font-mono text-on-surface">
          {e.value} <span className="text-xs text-on-surface-variant">{e.unit}</span>
        </span>
      ),
    },
    {
      header: '표준 / GWP',
      cell: (e) => (
        <div className="flex items-center gap-1.5">
          <Pill tone="gray">{EF_STANDARD_LABEL[e.standard]}</Pill>
          <span className="text-xs text-on-surface-variant">{EF_GWP_LABEL[e.standard]}</span>
        </div>
      ),
    },
    { header: 'DQI', cell: (e) => e.dqi.toFixed(1), align: 'center' },
    { header: '상태', cell: (e) => <Pill tone={STATE_TONE[e.state]}>{EF_STATE_LABEL[e.state]}</Pill> },
    {
      header: '관리',
      align: 'right',
      cell: (e) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => openVersion(e)}
            className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
            title="새 연도/버전 값을 추가합니다 (기존 병존)"
          >
            <GitBranch className="h-3.5 w-3.5" /> 새 버전
          </button>
          <button
            type="button"
            onClick={() => navigate(`/admin/factors/${e.id}/history`)}
            className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-surface-container-high"
            title="버전 이력"
          >
            <History className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openEdit(e)}
            className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-surface-container-high"
            title="입력 오류 정정"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(e)}
            className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-error/10 hover:text-error"
            title="입력 오류 삭제"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const modalTitle =
    modal?.mode === 'create' ? '배출계수 신규 등록' : modal?.mode === 'version' ? '새 버전 등록' : '값 정정 (입력 오류 수정)';
  const isCreateLike = modal?.mode === 'create' || modal?.mode === 'version';

  return (
    <AdminShell>
      <PageHeader
        title="배출계수(EF) 관리"
        description="EF DB를 섹션별로 조회하고 연도·버전별로 신규 추가합니다. 삭제보다 신규 추가가 활발히 이루어지며, 연도/버전이 다른 값은 병존합니다."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> 신규 등록
          </Button>
        }
      />

      <InfoBanner>
        같은 항목이라도 <b className="font-semibold text-on-surface">적용연도·데이터 버전이 다르면 별도 레코드로 병존</b>합니다(예:
        전력 배출계수 2022 / 2023). 자동 매칭 로직이 프로젝트 연도·메타를 참고해 최적 값을 선택하므로, 과거 레코드도 삭제하지 않고
        유지합니다. 정정·삭제는 관리자가 잘못 입력한 값을 바로잡는 용도로만 사용하세요.
      </InfoBanner>

      <div className="mt-4">
        <FilterBar>
          <Select
            className="w-auto"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            options={[{ value: 'all', label: '전체 단계' }, ...Object.entries(EF_STAGE_LABEL).map(([v, l]) => ({ value: v, label: l }))]}
          />
          <Select
            className="w-auto"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            options={[
              { value: 'all', label: '전체 표준' },
              { value: 'iso', label: 'ISO 14067' },
              { value: 'epd', label: '환경성적표지' },
            ]}
          />
          <Select
            className="w-auto"
            value={state}
            onChange={(e) => setState(e.target.value)}
            options={[
              { value: 'all', label: '전체 상태' },
              { value: 'active', label: '현재버전' },
              { value: 'pending', label: '적용대기중' },
              { value: 'archived', label: '이력' },
            ]}
          />
          <span className="ml-auto text-sm text-on-surface-variant">총 {rows.length}건</span>
        </FilterBar>

        <Card>
          <DataTable columns={columns} rows={rows} rowKey={(e) => e.id} />
        </Card>
      </div>

      {/* 등록/새버전/정정 폼 모달 */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modalTitle}
        wide
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModal(null)}>
              취소
            </Button>
            <Button size="sm" onClick={submit} disabled={!form.name || !form.value || !form.unit || !form.source}>
              {modal?.mode === 'edit' ? '정정 확정' : '등록 확정 (적용대기중 저장)'}
            </Button>
          </>
        }
      >
        {modal?.mode === 'version' && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm leading-relaxed text-on-surface">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              기존 값 <b>{modal.target?.value} {modal.target?.unit}</b>({modal.target?.meta?.effectiveYear ?? '연도 미상'})은
              그대로 <b>유지·병존</b>하고, 새 연도/버전 값이 &quot;적용대기중&quot;으로 추가됩니다.
            </span>
          </div>
        )}
        {modal?.mode === 'edit' && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>정정은 <b>기존 값을 덮어쓰는 오류 수정 전용</b>입니다. 새 연도/버전 반영은 &quot;새 버전 등록&quot;을 사용하세요.</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="항목명" required className="sm:col-span-2">
            <TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} disabled={modal?.mode !== 'create'} placeholder="예: 전력 배출계수" />
          </FormField>
          <FormField label="LCA 단계" required>
            <Select
              value={form.stage}
              onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
              disabled={modal?.mode !== 'create'}
              options={Object.entries(EF_STAGE_LABEL).map(([v, l]) => ({ value: v, label: l }))}
            />
          </FormField>
          <FormField label="적용 표준" required>
            <Select
              value={form.standard}
              onChange={(e) => setForm((f) => ({ ...f, standard: e.target.value }))}
              disabled={modal?.mode !== 'create'}
              options={[
                { value: 'iso', label: 'ISO 14067 (GWP: AR5)' },
                { value: 'epd', label: '환경성적표지 (GWP: SAR 준용)' },
              ]}
            />
          </FormField>
          <FormField label="값" required>
            <TextInput type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="0.000" />
          </FormField>
          <FormField label="단위" required>
            <TextInput value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="kg CO2e/kWh" />
          </FormField>
          <FormField label="출처 (문헌·기관명·발행연도)" required className="sm:col-span-2">
            <TextInput value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} placeholder="예: EG-TIPS 2026" />
          </FormField>
        </div>

        <div className="mt-4">
          <MetaFields meta={form.meta} onChange={(patch) => setForm((f) => ({ ...f, meta: { ...f.meta, ...patch } }))} />
        </div>

        {isCreateLike && (
          <div className="mt-4 rounded-md border border-outline-variant p-4">
            <p className="mb-3 text-sm font-bold text-on-surface">데이터 품질 평가 (DQI) 6항목</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {DQI_CRITERIA.map((c) => (
                <FormField key={c.key} label={c.label}>
                  <Select options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}점` }))} />
                </FormField>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* 삭제 확인 */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="배출계수 삭제"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button size="sm" className="bg-error hover:bg-error/90" onClick={confirmDelete}>
              삭제 확정
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <b>{deleteTarget?.name}</b>
            {deleteTarget?.meta?.effectiveYear && ` (적용 ${deleteTarget.meta.effectiveYear})`} 레코드를 삭제합니다. 연도/버전이
            다른 정상 데이터가 아니라 <b>잘못 입력한 데이터</b>인지 확인하세요. (감사 로그 기록됨)
          </span>
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
