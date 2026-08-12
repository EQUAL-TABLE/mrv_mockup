import { Boxes, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Card, CardTitle, Column, DataTable, Modal, Pill, Toast, useFlash } from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';
import { FormField, Select, TextInput } from '@/components/ui/form';
import {
  EMISSION_FACTORS,
  INPUT_CATEGORY_LABEL,
  INPUT_MATERIALS,
  InputCategory,
  InputMaterial,
} from '@/data/admin';

const efName = (id?: string) => {
  if (!id) return null;
  const ef = EMISSION_FACTORS.find((e) => e.id === id);
  return ef ? `${ef.name} (${ef.value} ${ef.unit})` : id;
};

interface Form {
  name: string;
  category: InputCategory;
  unit: string;
  efId: string;
}
const EMPTY: Form = { name: '', category: 'raw', unit: 'kg', efId: '' };

/** ① 투입물 목록 — 원부자재·포장재·에너지 마스터 + 생산 EF 연결 */
export function InputMaterialsTab() {
  const { msg, flash } = useFlash();
  const [rows, setRows] = useState<InputMaterial[]>(INPUT_MATERIALS);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; target?: InputMaterial } | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [del, setDel] = useState<InputMaterial | null>(null);
  const idRef = useRef(5000);

  const open = (mode: 'add' | 'edit', row?: InputMaterial) => {
    setForm(row ? { name: row.name, category: row.category, unit: row.unit, efId: row.efId ?? '' } : EMPTY);
    setModal({ mode, target: row });
  };
  const submit = () => {
    if (!modal) return;
    const patch = { name: form.name, category: form.category, unit: form.unit, efId: form.efId || undefined };
    if (modal.mode === 'edit' && modal.target) {
      setRows((r) => r.map((x) => (x.id === modal.target!.id ? { ...x, ...patch } : x)));
      flash('투입물을 수정했습니다.');
    } else {
      setRows((r) => [{ id: `in-${idRef.current++}`, ...patch }, ...r]);
      flash('투입물을 추가했습니다.');
    }
    setModal(null);
  };

  const efOptions = [
    { value: '', label: '연결 안 함' },
    ...EMISSION_FACTORS.map((e) => ({ value: e.id, label: `${e.name}${e.meta?.effectiveYear ? ` · ${e.meta.effectiveYear}` : ''}` })),
  ];

  const columns: Column<InputMaterial>[] = [
    { header: '투입물명', cell: (m) => <span className="font-medium text-on-surface">{m.name}</span> },
    { header: '분류', cell: (m) => <Pill tone="gray">{INPUT_CATEGORY_LABEL[m.category]}</Pill> },
    { header: '단위', cell: (m) => m.unit, align: 'center' },
    {
      header: '연결 생산 EF',
      cell: (m) => (efName(m.efId) ? <span className="text-on-surface-variant">{efName(m.efId)}</span> : <Pill tone="amber">미연결</Pill>),
    },
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
          title="투입물 목록"
          sub="원부자재·포장재·에너지. 각 투입물의 생산(원부자재·에너지) EF를 연결합니다."
          actions={<Button size="sm" onClick={() => open('add')}><Plus className="h-4 w-4" /> 투입물 추가</Button>}
        />
        <DataTable columns={columns} rows={rows} rowKey={(m) => m.id} />
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? '투입물 추가' : '투입물 수정'}
        wide
        footer={<><Button variant="secondary" size="sm" onClick={() => setModal(null)}>취소</Button><Button size="sm" onClick={submit} disabled={!form.name || !form.unit}>저장</Button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="투입물명" required className="sm:col-span-2">
            <TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="예: 생두" />
          </FormField>
          <FormField label="분류" required>
            <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as InputCategory }))} options={Object.entries(INPUT_CATEGORY_LABEL).map(([v, l]) => ({ value: v, label: l }))} />
          </FormField>
          <FormField label="단위" required>
            <TextInput value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="kg / kWh / m³" />
          </FormField>
          <FormField label="연결 생산 EF" className="sm:col-span-2" help="배출계수 관리에 등록된 원부자재·에너지 EF와 연결합니다.">
            <Select value={form.efId} onChange={(e) => setForm((f) => ({ ...f, efId: e.target.value }))} options={efOptions} />
          </FormField>
        </div>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="투입물 삭제" footer={<><Button variant="secondary" size="sm" onClick={() => setDel(null)}>취소</Button><Button size="sm" className="bg-error hover:bg-error/90" onClick={() => { setRows((r) => r.filter((x) => x.id !== del!.id)); flash('투입물을 삭제했습니다.'); setDel(null); }}>삭제 확정</Button></>}>
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
          <Boxes className="mt-0.5 h-4 w-4 shrink-0" />
          <span><b>{del?.name}</b>을(를) 삭제합니다. 발생 매핑에서 이 투입물을 참조 중이면 연결이 끊길 수 있습니다.</span>
        </div>
      </Modal>

      <Toast msg={msg} />
    </>
  );
}
