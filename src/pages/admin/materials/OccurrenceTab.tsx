import { ArrowRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Card, CardTitle, Column, DataTable, Modal, Toast, useFlash } from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';
import { FormField, Select, TextInput } from '@/components/ui/form';
import { INPUT_MATERIALS, OCCURRENCE_MAPS, OccurrenceMap, WASTE_ITEMS, inputName, wasteItemName } from '@/data/admin';

interface Form {
  inputId: string;
  wasteItemId: string;
  coefficient: string;
  coeffUnit: string;
  basis: string;
}
const EMPTY: Form = { inputId: INPUT_MATERIALS[0]?.id ?? '', wasteItemId: WASTE_ITEMS[0]?.id ?? '', coefficient: '', coeffUnit: 'kg/kg', basis: '' };

/** ④ 발생 매핑 — 투입물 → 발생 폐기물 + 발생계수 */
export function OccurrenceTab() {
  const { msg, flash } = useFlash();
  const [rows, setRows] = useState<OccurrenceMap[]>(OCCURRENCE_MAPS);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; target?: OccurrenceMap } | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [del, setDel] = useState<OccurrenceMap | null>(null);
  const idRef = useRef(8000);

  const open = (mode: 'add' | 'edit', row?: OccurrenceMap) => {
    setForm(row ? { inputId: row.inputId, wasteItemId: row.wasteItemId, coefficient: String(row.coefficient), coeffUnit: row.coeffUnit, basis: row.basis } : EMPTY);
    setModal({ mode, target: row });
  };
  const submit = () => {
    if (!modal) return;
    const patch = { inputId: form.inputId, wasteItemId: form.wasteItemId, coefficient: Number(form.coefficient), coeffUnit: form.coeffUnit, basis: form.basis };
    if (modal.mode === 'edit' && modal.target) {
      setRows((r) => r.map((x) => (x.id === modal.target!.id ? { ...x, ...patch } : x)));
      flash('발생 매핑을 수정했습니다.');
    } else {
      setRows((r) => [{ id: `om-${idRef.current++}`, ...patch }, ...r]);
      flash('발생 매핑을 추가했습니다.');
    }
    setModal(null);
  };

  const inputOptions = INPUT_MATERIALS.map((i) => ({ value: i.id, label: i.name }));
  const wasteOptions = WASTE_ITEMS.map((w) => ({ value: w.id, label: w.name }));

  const columns: Column<OccurrenceMap>[] = [
    {
      header: '투입물 → 발생 폐기물',
      cell: (m) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-on-surface">{inputName(m.inputId)}</span>
          <ArrowRight className="h-3.5 w-3.5 text-on-surface-variant" />
          <span className="font-medium text-on-surface">{wasteItemName(m.wasteItemId)}</span>
        </div>
      ),
    },
    { header: '발생계수', align: 'right', cell: (m) => <span className="font-mono">{m.coefficient} <span className="text-xs text-on-surface-variant">{m.coeffUnit}</span></span> },
    { header: '근거', cell: (m) => <span className="text-on-surface-variant">{m.basis}</span> },
    {
      header: '관리',
      align: 'right',
      cell: (m) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => open('edit', m)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-surface-container-high" title="수정">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setDel(m)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-error/10 hover:text-error" title="삭제">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardTitle
          title="발생 매핑 (투입물 → 폐기물)"
          sub="어떤 투입물이 어떤 폐기물을 얼마나(발생계수) 발생시키는지 정의합니다. 수율·채프계수·함수율 등이 근거."
          actions={<Button size="sm" onClick={() => open('add')}><Plus className="h-4 w-4" /> 매핑 추가</Button>}
        />
        <DataTable columns={columns} rows={rows} rowKey={(m) => m.id} />
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? '발생 매핑 추가' : '발생 매핑 수정'}
        wide
        footer={<><Button variant="secondary" size="sm" onClick={() => setModal(null)}>취소</Button><Button size="sm" onClick={submit} disabled={!form.coefficient}>저장</Button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="투입물" required>
            <Select value={form.inputId} onChange={(e) => setForm((f) => ({ ...f, inputId: e.target.value }))} options={inputOptions} />
          </FormField>
          <FormField label="발생 폐기물" required>
            <Select value={form.wasteItemId} onChange={(e) => setForm((f) => ({ ...f, wasteItemId: e.target.value }))} options={wasteOptions} />
          </FormField>
          <FormField label="발생계수" required help="투입 1단위당 발생하는 폐기물량">
            <TextInput type="number" value={form.coefficient} onChange={(e) => setForm((f) => ({ ...f, coefficient: e.target.value }))} placeholder="예: 0.05" />
          </FormField>
          <FormField label="단위">
            <TextInput value={form.coeffUnit} onChange={(e) => setForm((f) => ({ ...f, coeffUnit: e.target.value }))} placeholder="kg/kg" />
          </FormField>
          <FormField label="근거" className="sm:col-span-2">
            <TextInput value={form.basis} onChange={(e) => setForm((f) => ({ ...f, basis: e.target.value }))} placeholder="예: 채프 계수 0.05 / 로스팅 수율 82%" />
          </FormField>
        </div>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="발생 매핑 삭제" footer={<><Button variant="secondary" size="sm" onClick={() => setDel(null)}>취소</Button><Button size="sm" className="bg-error hover:bg-error/90" onClick={() => { setRows((r) => r.filter((x) => x.id !== del!.id)); flash('발생 매핑을 삭제했습니다.'); setDel(null); }}>삭제 확정</Button></>}>
        <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
          <b>{del && `${inputName(del.inputId)} → ${wasteItemName(del.wasteItemId)}`}</b> 매핑을 삭제합니다.
        </div>
      </Modal>

      <Toast msg={msg} />
    </>
  );
}
