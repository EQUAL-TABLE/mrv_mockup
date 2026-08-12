import { Building } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, Column, DataTable, EmptyState, FilterBar, PageHeader, Pill } from '@/components/admin/ui';
import { InfoBanner } from '@/components/ui/form';
import { Select } from '@/components/ui/form';
import { TENANT_STATUS_LABEL, TENANTS, Tenant, TenantStatus } from '@/data/admin';

const STATUS_TONE: Record<TenantStatus, 'green' | 'amber'> = { active: 'green', suspended: 'amber' };

/** ADM-TENANT-001 테넌트 목록 조회 — 전체 기업(테넌트) */
export function Tenants() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('all');
  const rows = TENANTS.filter((t) => status === 'all' || t.status === status);

  const columns: Column<Tenant>[] = [
    {
      header: '조직명',
      cell: (t) => (
        <div>
          <p className="font-medium text-on-surface">{t.name}</p>
          <p className="font-mono text-xs text-on-surface-variant">{t.bizNo}</p>
        </div>
      ),
    },
    { header: '대표담당자', cell: (t) => t.owner },
    { header: '소속 사용자', cell: (t) => `${t.userCount}명`, align: 'right' },
    { header: '프로젝트', cell: (t) => `${t.projectCount}건`, align: 'right' },
    { header: '가입일', cell: (t) => t.joinedAt },
    { header: '상태', cell: (t) => <Pill tone={STATUS_TONE[t.status]}>{TENANT_STATUS_LABEL[t.status]}</Pill> },
  ];

  return (
    <AdminShell>
      <PageHeader
        title="조직(테넌트) 관리"
        description="전체 기업(테넌트) 목록을 조회하고 조직 상태를 관리합니다."
      />

      <InfoBanner>
        신규 조직은 회원가입 시 사업자등록증 OCR 인식 후 <b className="font-semibold text-on-surface">사전 승인 없이 즉시 활성화</b>
        됩니다. 관리자는 사후 정지 조치만 수행합니다.
      </InfoBanner>

      <div className="mt-4">
        <FilterBar>
          <Select
            className="w-auto"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: '전체 상태' },
              { value: 'active', label: '활성' },
              { value: 'suspended', label: '정지' },
            ]}
          />
          <span className="ml-auto text-sm text-on-surface-variant">총 {rows.length}개 조직</span>
        </FilterBar>

        <Card>
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(t) => t.id}
            onRowClick={(t) => navigate(`/admin/tenants/${t.id}`)}
            empty={<EmptyState Icon={Building} title="조건에 맞는 조직이 없습니다" />}
          />
        </Card>
      </div>
    </AdminShell>
  );
}
