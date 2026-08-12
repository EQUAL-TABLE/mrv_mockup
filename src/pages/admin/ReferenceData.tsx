import { AlertTriangle, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, CardTitle, Column, DataTable, MetaBadges, MetaFields, Modal, PageHeader, Pill, Tabs } from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';
import { FormField, InfoBanner, Select, TextInput } from '@/components/ui/form';
import { SUBSTANCE_NORMS, SubstanceNorm, VersionMeta, WASTE_FACILITIES, WasteFacility } from '@/data/admin';

const TABS = [
  { key: 'facilities', label: '폐기물 처리시설 위치 DB' },
  { key: 'substances', label: '물질 정규화 DB' },
];

const METHOD_TONE = { 소각: 'red', 매립: 'amber', 재활용: 'green' } as const;
const TODAY = '2026-08-12';

interface FacilityForm {
  name: string;
  address: string;
  method: WasteFacility['method'];
  region: string;
  meta: VersionMeta;
}
interface SubstanceForm {
  standard: string;
  aliases: string;
  efCategory: string;
  meta: VersionMeta;
}

export function ReferenceData() {
  const [tab, setTab] = useState('facilities');
  const [toast, setToast] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const idRef = useRef(4000);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  // ── 폐기물 처리시설 ──
  const [facilities, setFacilities] = useState<WasteFacility[]>(WASTE_FACILITIES);
  const [fModal, setFModal] = useState<{ mode: 'add' | 'edit'; target?: WasteFacility } | null>(null);
  const [fForm, setFForm] = useState<FacilityForm>({ name: '', address: '', method: '소각', region: '', meta: {} });
  const [fDelete, setFDelete] = useState<WasteFacility | null>(null);

  const openFacility = (mode: 'add' | 'edit', row?: WasteFacility) => {
    if (mode === 'add') setFForm({ name: '', address: '', method: '소각', region: '', meta: { registeredAt: TODAY } });
    else if (row) setFForm({ name: row.name, address: row.address, method: row.method, region: row.region, meta: { ...row.meta } });
    setFModal({ mode, target: row });
  };
  const submitFacility = () => {
    if (!fModal) return;
    if (fModal.mode === 'edit' && fModal.target) {
      setFacilities((rows) => rows.map((r) => (r.id === fModal.target!.id ? { ...r, ...fForm } : r)));
      flash('시설 정보를 정정했습니다. (감사 로그 기록됨)');
    } else {
      setFacilities((rows) => [{ id: `wf-${idRef.current++}`, ...fForm, meta: { ...fForm.meta, registeredAt: TODAY } }, ...rows]);
      flash('처리시설을 추가했습니다.');
    }
    setFModal(null);
  };

  // ── 물질 정규화 ──
  const [subs, setSubs] = useState<SubstanceNorm[]>(SUBSTANCE_NORMS);
  const [sModal, setSModal] = useState<{ mode: 'add' | 'edit'; target?: SubstanceNorm } | null>(null);
  const [sForm, setSForm] = useState<SubstanceForm>({ standard: '', aliases: '', efCategory: '', meta: {} });
  const [sDelete, setSDelete] = useState<SubstanceNorm | null>(null);

  const openSub = (mode: 'add' | 'edit', row?: SubstanceNorm) => {
    if (mode === 'add') setSForm({ standard: '', aliases: '', efCategory: '', meta: { registeredAt: TODAY } });
    else if (row) setSForm({ standard: row.standard, aliases: row.aliases.join(', '), efCategory: row.efCategory, meta: { ...row.meta } });
    setSModal({ mode, target: row });
  };
  const submitSub = () => {
    if (!sModal) return;
    const aliases = sForm.aliases.split(',').map((a) => a.trim()).filter(Boolean);
    if (sModal.mode === 'edit' && sModal.target) {
      setSubs((rows) => rows.map((r) => (r.id === sModal.target!.id ? { ...r, standard: sForm.standard, aliases, efCategory: sForm.efCategory, meta: sForm.meta } : r)));
      flash('물질 정보를 정정했습니다. (감사 로그 기록됨)');
    } else {
      setSubs((rows) => [{ id: `sn-${idRef.current++}`, standard: sForm.standard, aliases, efCategory: sForm.efCategory, meta: { ...sForm.meta, registeredAt: TODAY } }, ...rows]);
      flash('표준 물질을 추가했습니다.');
    }
    setSModal(null);
  };

  const rowActions = (onEdit: () => void, onDelete: () => void) => (
    <div className="flex items-center justify-end gap-1">
      <button type="button" onClick={onEdit} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-surface-container-high" title="정정">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onDelete} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-error/10 hover:text-error" title="삭제">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  const facilityColumns: Column<WasteFacility>[] = [
    { header: '시설명', cell: (f) => <span className="font-medium text-on-surface">{f.name}</span> },
    { header: '주소', cell: (f) => <span className="text-on-surface-variant">{f.address}</span> },
    { header: '처리방식', cell: (f) => <Pill tone={METHOD_TONE[f.method]}>{f.method}</Pill> },
    { header: '매핑 기준 지역', cell: (f) => f.region },
    { header: '적용연도 · 버전', cell: (f) => <MetaBadges meta={f.meta} /> },
    { header: '관리', align: 'right', cell: (f) => rowActions(() => openFacility('edit', f), () => setFDelete(f)) },
  ];

  const substanceColumns: Column<SubstanceNorm>[] = [
    { header: '표준 물질명', cell: (s) => <span className="font-medium text-on-surface">{s.standard}</span> },
    {
      header: '별칭',
      cell: (s) => (
        <div className="flex flex-wrap gap-1">
          {s.aliases.map((a) => <Pill key={a} tone="gray">{a}</Pill>)}
        </div>
      ),
    },
    { header: '연결 EF 카테고리', cell: (s) => <span className="text-on-surface-variant">{s.efCategory}</span> },
    { header: '버전', cell: (s) => <MetaBadges meta={s.meta} /> },
    { header: '관리', align: 'right', cell: (s) => rowActions(() => openSub('edit', s), () => setSDelete(s)) },
  ];

  return (
    <AdminShell>
      <PageHeader
        title="참조 데이터셋 관리"
        description="EF 매칭 알고리즘과 폐기단계 자동 매핑의 기준점이 되는 참조 데이터를 관리합니다. 환경부 DB는 매년 갱신되므로 적용연도·버전으로 병존 관리합니다."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" /> CSV/Excel 업로드
            </Button>
            <Button size="sm" onClick={() => (tab === 'facilities' ? openFacility('add') : openSub('add'))}>
              <Plus className="h-4 w-4" /> 개별 추가
            </Button>
          </>
        }
      />

      <InfoBanner>
        일괄 업로드·개별 추가 → 확인(변경 건수 + 적용시작일) → &quot;적용대기중&quot; → 24시간 후 자동 전환. 연도/버전이 다른
        데이터는 <b className="font-semibold text-on-surface">병존</b>하며(과거 프로젝트 매칭에 사용), 정정·삭제는 잘못 입력한
        데이터 정정 용도로만 사용하세요.
      </InfoBanner>

      <div className="mt-4">
        <Tabs items={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="mt-5">
        {tab === 'facilities' && (
          <Card>
            <CardTitle title="폐기물 처리시설 위치 DB" sub="환경부 전국폐기물처리시설현황 기반 · 폐기단계-수송 시군구 자동 매핑 기준점" />
            <DataTable columns={facilityColumns} rows={facilities} rowKey={(f) => f.id} />
          </Card>
        )}
        {tab === 'substances' && (
          <Card>
            <CardTitle title="물질 정규화 DB" sub="Dual-Stage Matching 기준 물질명 마스터 데이터" />
            <DataTable columns={substanceColumns} rows={subs} rowKey={(s) => s.id} />
          </Card>
        )}
      </div>

      {/* 업로드 */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="CSV/Excel 일괄 업로드"
        footer={<><Button variant="secondary" size="sm" onClick={() => setUploadOpen(false)}>취소</Button><Button size="sm" onClick={() => { setUploadOpen(false); flash('변경 6건을 "적용대기중"으로 저장했습니다. 24시간 후 자동 전환됩니다.'); }}>등록 확정</Button></>}
      >
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-outline-variant bg-surface-container-low/40 py-8 text-center">
          <Upload className="h-6 w-6 text-on-surface-variant" />
          <p className="text-sm font-semibold text-on-surface">파일을 끌어다 놓거나 클릭하여 선택</p>
          <p className="text-xs text-on-surface-variant">.csv, .xlsx 지원</p>
        </div>
        <FormField label="적용 시작일" className="mt-4" hint="기본값 = 등록일 + 24시간">
          <TextInput type="datetime-local" />
        </FormField>
      </Modal>

      {/* 시설 폼 */}
      <Modal
        open={!!fModal}
        onClose={() => setFModal(null)}
        title={fModal?.mode === 'add' ? '처리시설 추가' : '처리시설 정정'}
        wide
        footer={<><Button variant="secondary" size="sm" onClick={() => setFModal(null)}>취소</Button><Button size="sm" onClick={submitFacility} disabled={!fForm.name || !fForm.address}>{fModal?.mode === 'add' ? '추가' : '정정 확정'}</Button></>}
      >
        {fModal?.mode === 'edit' && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>정정은 입력 오류 수정 전용입니다. 신규 연도 DB 반영은 &quot;개별 추가/업로드&quot;로 병존시키세요.</span>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="시설명" required><TextInput value={fForm.name} onChange={(e) => setFForm((f) => ({ ...f, name: e.target.value }))} placeholder="예: 마포 자원회수시설" /></FormField>
          <FormField label="처리방식" required>
            <Select value={fForm.method} onChange={(e) => setFForm((f) => ({ ...f, method: e.target.value as WasteFacility['method'] }))} options={[{ value: '소각', label: '소각' }, { value: '매립', label: '매립' }, { value: '재활용', label: '재활용' }]} />
          </FormField>
          <FormField label="주소" required className="sm:col-span-2"><TextInput value={fForm.address} onChange={(e) => setFForm((f) => ({ ...f, address: e.target.value }))} placeholder="예: 서울 마포구 상암동 481" /></FormField>
          <FormField label="매핑 기준 지역" className="sm:col-span-2"><TextInput value={fForm.region} onChange={(e) => setFForm((f) => ({ ...f, region: e.target.value }))} placeholder="예: 서울 마포구" /></FormField>
        </div>
        <div className="mt-4"><MetaFields meta={fForm.meta} onChange={(patch) => setFForm((f) => ({ ...f, meta: { ...f.meta, ...patch } }))} /></div>
      </Modal>

      {/* 시설 삭제 */}
      <Modal open={!!fDelete} onClose={() => setFDelete(null)} title="처리시설 삭제" footer={<><Button variant="secondary" size="sm" onClick={() => setFDelete(null)}>취소</Button><Button size="sm" className="bg-error hover:bg-error/90" onClick={() => { setFacilities((r) => r.filter((x) => x.id !== fDelete!.id)); flash('처리시설을 삭제했습니다.'); setFDelete(null); }}>삭제 확정</Button></>}>
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span><b>{fDelete?.name}</b>을(를) 삭제합니다. 잘못 입력한 경우에만 삭제하세요. (감사 로그 기록됨)</span>
        </div>
      </Modal>

      {/* 물질 폼 */}
      <Modal
        open={!!sModal}
        onClose={() => setSModal(null)}
        title={sModal?.mode === 'add' ? '표준 물질 추가' : '표준 물질 정정'}
        wide
        footer={<><Button variant="secondary" size="sm" onClick={() => setSModal(null)}>취소</Button><Button size="sm" onClick={submitSub} disabled={!sForm.standard || !sForm.efCategory}>{sModal?.mode === 'add' ? '추가' : '정정 확정'}</Button></>}
      >
        <div className="space-y-4">
          <FormField label="표준 물질명" required><TextInput value={sForm.standard} onChange={(e) => setSForm((f) => ({ ...f, standard: e.target.value }))} placeholder="예: 생두 (Green coffee bean)" /></FormField>
          <FormField label="별칭 (쉼표로 구분)"><TextInput value={sForm.aliases} onChange={(e) => setSForm((f) => ({ ...f, aliases: e.target.value }))} placeholder="그린빈, 생원두, green bean" /></FormField>
          <FormField label="연결 EF 카테고리" required><TextInput value={sForm.efCategory} onChange={(e) => setSForm((f) => ({ ...f, efCategory: e.target.value }))} placeholder="원부자재 > 생두" /></FormField>
          <MetaFields meta={sForm.meta} onChange={(patch) => setSForm((f) => ({ ...f, meta: { ...f.meta, ...patch } }))} />
        </div>
      </Modal>

      {/* 물질 삭제 */}
      <Modal open={!!sDelete} onClose={() => setSDelete(null)} title="표준 물질 삭제" footer={<><Button variant="secondary" size="sm" onClick={() => setSDelete(null)}>취소</Button><Button size="sm" className="bg-error hover:bg-error/90" onClick={() => { setSubs((r) => r.filter((x) => x.id !== sDelete!.id)); flash('표준 물질을 삭제했습니다.'); setSDelete(null); }}>삭제 확정</Button></>}>
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span><b>{sDelete?.standard}</b>을(를) 삭제합니다. 매칭 알고리즘 기준 데이터이므로 신중히 진행하세요. (감사 로그 기록됨)</span>
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
