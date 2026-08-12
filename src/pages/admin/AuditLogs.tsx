import { Lock } from 'lucide-react';
import { useState } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, Column, DataTable, FilterBar, PageHeader, Pill } from '@/components/admin/ui';
import { InfoBanner, Select } from '@/components/ui/form';
import { AUDIT_LOGS, AUDIT_TYPE_LABEL, AuditLog, AuditType } from '@/data/admin';

/** ADM-LOG-001 감사 로그 조회 — Admin 조작 이력, 조회 전용·영구 보존 */
export function AuditLogs() {
  const [type, setType] = useState('all');
  const [period, setPeriod] = useState('30');

  const rows = AUDIT_LOGS.filter((l) => type === 'all' || l.type === type);

  const columns: Column<AuditLog>[] = [
    { header: '조작일시', cell: (l) => l.at, className: 'whitespace-nowrap text-on-surface-variant' },
    { header: '조작자', cell: (l) => <span className="font-medium text-on-surface">{l.actor}</span> },
    { header: '유형', cell: (l) => <Pill tone="gray">{AUDIT_TYPE_LABEL[l.type]}</Pill> },
    { header: '조작', cell: (l) => l.action },
    { header: '대상', cell: (l) => <span className="text-on-surface-variant">{l.target}</span> },
    {
      header: '변경 전 → 후',
      cell: (l) => (
        <span className="font-mono text-xs">
          <span className="text-on-surface-variant">{l.before}</span>
          <span className="mx-1">→</span>
          <span className="font-semibold text-on-surface">{l.after}</span>
        </span>
      ),
    },
    { header: '사유', cell: (l) => <span className="text-on-surface-variant">{l.reason}</span> },
  ];

  return (
    <AdminShell>
      <PageHeader
        title="감사 로그"
        description="관리자 자신의 조작 이력(배출계수·기준·참조 데이터 등록, 사용자·조직 상태 변경, 시스템 설정, 문서 원본 열람)을 조회합니다."
      />

      <InfoBanner>
        <span className="inline-flex items-center gap-1">
          <Lock className="h-3.5 w-3.5" />
          로그는 <b className="font-semibold text-on-surface">삭제 불가·영구 보존</b>되며 조회 전용입니다. 사용자의 프로젝트 내
          행위(OCR 수정 등)는 조직 상세의 프로젝트 감사 이력에서 별도 관리됩니다.
        </span>
      </InfoBanner>

      <div className="mt-4">
        <FilterBar>
          <Select
            className="w-auto"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'all', label: '전체 유형' },
              ...(Object.entries(AUDIT_TYPE_LABEL) as [AuditType, string][]).map(([v, l]) => ({ value: v, label: l })),
            ]}
          />
          <Select
            className="w-auto"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: '7', label: '최근 7일' },
              { value: '30', label: '최근 30일' },
              { value: '90', label: '최근 90일' },
            ]}
          />
          <span className="ml-auto text-sm text-on-surface-variant">총 {rows.length}건</span>
        </FilterBar>

        <Card>
          <DataTable columns={columns} rows={rows} rowKey={(l) => l.id} />
        </Card>
      </div>
    </AdminShell>
  );
}
