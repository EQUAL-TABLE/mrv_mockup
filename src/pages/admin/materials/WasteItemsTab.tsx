import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Card, CardTitle, Column, DataTable, Modal, Pill, Toast, useFlash } from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';
import { FormField, Select, TextInput } from '@/components/ui/form';
import { WASTE_CATEGORIES, WASTE_ITEMS, WasteItem, wasteCategoryName } from '@/data/admin';

const OVERRIDE_LABEL: Record<string, string> = { ratio: '통계 override', ef: 'EF override', both: '통계·EF override' };

interface Form {
  name: string;
  categoryId: string;
  override: '' | 'ratio' | 'ef' | 'both';
  note: string;
}
const EMPTY: Form = { name: '', categoryId: WASTE_CATEGORIES[0]?.id ?? '', override: '', note: '' };

/** ② 산출물·폐기물 목록 — 발생 폐기물 품목 마스터 + 성상 매핑(select) + 품목 override */
export function WasteItemsTab() {
  const { msg, flash } = useFlash();
  const [rows, setRows] = useState<WasteItem[]>(WASTE_ITEMS);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; target?: WasteItem } | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [del, setDel] = useState<WasteItem | null>(null);
  const idRef = useRef(6000);

  const open = (mode: 'add' | 'edit', row?: WasteItem) => {
    setForm(row ? { name: row.name, categoryId: row.categoryId, override: row.override ?? '', note: row.note ?? '' } : EMPTY);
    setModal({ mode, target: row });
  };
  const submit = () => {
    if (!modal) return;
    const patch = { name: form.name, categoryId: form.categoryId, override: (form.override || undefined) as WasteItem['override'], note: form.note || undefined };
    if (modal.mode === 'edit' && modal.target) {
      setRows((r) => r.map((x) => (x.id === modal.target!.id ? { ...x, ...patch } : x)));
      flash('폐기물 품목을 수정했습니다.');
    } else {
      setRows((r) => [{ id: `wi-${idRef.current++}`, ...patch }, ...r]);
      flash('폐기물 품목을 추가했습니다.');
    }
    setModal(null);
  };

  const catOptions = WASTE_CATEGORIES.map((c) => ({ value: c.id, label: c.name }));

  const columns: Column<WasteItem>[] = [
    {
      header: '폐기물 품목',
      cell: (w) => (
        <div>
          <p className="font-medium text-on-surface">{w.name}</p>
          {w.note && <p className="text-xs text-on-surface-variant">{w.note}</p>}
        </div>
      ),
    },
    { header: '기본 성상 (매핑)', cell: (w) => <Pill tone="green">{wasteCategoryName(w.categoryId)}</Pill> },
    { header: '품목 override', cell: (w) => (w.override ? <Pill tone="amber">{OVERRIDE_LABEL[w.override]}</Pill> : <span className="text-xs text-on-surface-variant">—</span>) },
    {
      header: '관리',
      align: 'right',
      cell: (w) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => open('edit', w)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-surface-container-high" title="수정">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setDel(w)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-error/10 hover:text-error" title="삭제">
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
          title="산출물·폐기물 목록"
          sub="발생 폐기물 품목. 각 품목을 폐기물 성상에 매핑(select)하고, 필요 시 품목 단위로 별도 통계·EF를 override 합니다."
          actions={<Button size="sm" onClick={() => open('add')}><Plus className="h-4 w-4" /> 품목 추가</Button>}
        />
        <DataTable columns={columns} rows={rows} rowKey={(w) => w.id} />
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? '폐기물 품목 추가' : '폐기물 품목 수정'}
        wide
        footer={<><Button variant="secondary" size="sm" onClick={() => setModal(null)}>취소</Button><Button size="sm" onClick={submit} disabled={!form.name || !form.categoryId}>저장</Button></>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="품목명" required className="sm:col-span-2">
            <TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="예: 알루미늄포일 폐기물" />
          </FormField>
          <FormField label="기본 성상 (매핑)" required help="처리 비율·EF의 기본 분류. 처리 비율 화면은 이 성상 값을 따릅니다.">
            <Select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} options={catOptions} />
          </FormField>
          <FormField label="품목 override" help="성상 통계/EF 대신 품목 전용 값을 쓸 때 선택. 예: 복합재질 포장재.">
            <Select
              value={form.override}
              onChange={(e) => setForm((f) => ({ ...f, override: e.target.value as Form['override'] }))}
              options={[
                { value: '', label: '없음 (성상 값 사용)' },
                { value: 'ratio', label: '처리 통계 override' },
                { value: 'ef', label: '처리 EF override' },
                { value: 'both', label: '통계·EF 모두 override' },
              ]}
            />
          </FormField>
          <FormField label="비고" className="sm:col-span-2">
            <TextInput value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="예: 복합재질 — 품목별 별도 통계·EF 적용" />
          </FormField>
        </div>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="폐기물 품목 삭제" footer={<><Button variant="secondary" size="sm" onClick={() => setDel(null)}>취소</Button><Button size="sm" className="bg-error hover:bg-error/90" onClick={() => { setRows((r) => r.filter((x) => x.id !== del!.id)); flash('품목을 삭제했습니다.'); setDel(null); }}>삭제 확정</Button></>}>
        <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
          <b>{del?.name}</b>을(를) 삭제합니다. 발생 매핑·처리 비율에서 참조 중이면 연결이 끊길 수 있습니다.
        </div>
      </Modal>

      <Toast msg={msg} />
    </>
  );
}
