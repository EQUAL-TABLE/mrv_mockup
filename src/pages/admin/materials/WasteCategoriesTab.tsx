import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Card, CardTitle, Column, DataTable, Modal, Toast, useFlash } from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';
import { FormField, InfoBanner, TextInput } from '@/components/ui/form';
import { WASTE_CATEGORIES, WASTE_ITEMS, WasteCategory } from '@/data/admin';

interface Form {
  name: string;
  note: string;
}

/** ③ 폐기물 성상 마스터 — admin CRUD. 처리 비율·EF의 기본 분류 단위 */
export function WasteCategoriesTab() {
  const { msg, flash } = useFlash();
  const [rows, setRows] = useState<WasteCategory[]>(WASTE_CATEGORIES);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; target?: WasteCategory } | null>(null);
  const [form, setForm] = useState<Form>({ name: '', note: '' });
  const [del, setDel] = useState<WasteCategory | null>(null);
  const idRef = useRef(7000);

  const usedCount = (id: string) => WASTE_ITEMS.filter((w) => w.categoryId === id).length;

  const open = (mode: 'add' | 'edit', row?: WasteCategory) => {
    setForm(row ? { name: row.name, note: row.note ?? '' } : { name: '', note: '' });
    setModal({ mode, target: row });
  };
  const submit = () => {
    if (!modal) return;
    if (modal.mode === 'edit' && modal.target) {
      setRows((r) => r.map((x) => (x.id === modal.target!.id ? { ...x, name: form.name, note: form.note || undefined } : x)));
      flash('성상을 수정했습니다.');
    } else {
      setRows((r) => [...r, { id: `wc-${idRef.current++}`, name: form.name, note: form.note || undefined }]);
      flash('성상을 추가했습니다. 처리 비율·처리 EF 연결이 필요합니다.');
    }
    setModal(null);
  };

  const columns: Column<WasteCategory>[] = [
    { header: '성상(폐기물 종류)', cell: (c) => <span className="font-medium text-on-surface">{c.name}</span> },
    { header: '비고', cell: (c) => <span className="text-on-surface-variant">{c.note ?? '—'}</span> },
    { header: '연결 품목', cell: (c) => `${usedCount(c.id)}개`, align: 'center' },
    {
      header: '관리',
      align: 'right',
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button type="button" onClick={() => open('edit', c)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-surface-container-high" title="수정">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setDel(c)} className="rounded-md p-1.5 text-on-surface-variant transition hover:bg-error/10 hover:text-error" title="삭제">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <InfoBanner>
        성상은 처리 비율(연도별 통계)과 처리 EF의 <b className="font-semibold text-on-surface">기본 분류 단위</b>입니다. 새 성상을
        추가하면 해당 성상의 처리 비율·처리 EF를 별도로 등록해야 계산에 반영됩니다.
      </InfoBanner>
      <div className="mt-4">
        <Card>
          <CardTitle title="폐기물 성상" sub="생활폐기물·혼합 폐플라스틱·폐지 등" actions={<Button size="sm" onClick={() => open('add')}><Plus className="h-4 w-4" /> 성상 추가</Button>} />
          <DataTable columns={columns} rows={rows} rowKey={(c) => c.id} />
        </Card>
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? '성상 추가' : '성상 수정'}
        footer={<><Button variant="secondary" size="sm" onClick={() => setModal(null)}>취소</Button><Button size="sm" onClick={submit} disabled={!form.name}>저장</Button></>}
      >
        <div className="space-y-3">
          <FormField label="성상명" required>
            <TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="예: 생활폐기물" />
          </FormField>
          <FormField label="비고">
            <TextInput value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="예: 종량제 혼합배출·가연성 기준" />
          </FormField>
        </div>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="성상 삭제" footer={<><Button variant="secondary" size="sm" onClick={() => setDel(null)}>취소</Button><Button size="sm" className="bg-error hover:bg-error/90" onClick={() => { setRows((r) => r.filter((x) => x.id !== del!.id)); flash('성상을 삭제했습니다.'); setDel(null); }} disabled={!!del && usedCount(del.id) > 0}>삭제 확정</Button></>}>
        {del && usedCount(del.id) > 0 ? (
          <div className="flex items-start gap-2 rounded-md border border-error/40 bg-error/5 p-3 text-sm leading-relaxed text-error">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span><b>{del.name}</b>에 연결된 품목이 {usedCount(del.id)}개 있습니다. 품목의 성상 매핑을 먼저 변경해야 삭제할 수 있습니다.</span>
          </div>
        ) : (
          <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
            <b>{del?.name}</b>을(를) 삭제합니다. 해당 성상의 처리 비율·EF도 함께 정리하세요.
          </div>
        )}
      </Modal>

      <Toast msg={msg} />
    </>
  );
}
