import { UserX } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, Column, DataTable, EmptyState, FilterBar, PageHeader, Pill } from '@/components/admin/ui';
import { Select } from '@/components/ui/form';
import {
  ADMIN_USERS,
  AdminUser,
  TENANTS,
  USER_ROLE_LABEL,
  USER_STATUS_LABEL,
  UserStatus,
} from '@/data/admin';

const STATUS_TONE: Record<UserStatus, 'green' | 'amber' | 'gray'> = {
  active: 'green',
  suspended: 'amber',
  withdrawn: 'gray',
};

/** ADM-USER-001 사용자 목록 조회 — 전체 테넌트 소속 사용자 계정 */
export function Users() {
  const navigate = useNavigate();
  const [tenant, setTenant] = useState('all');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');

  const rows = ADMIN_USERS.filter(
    (u) =>
      (tenant === 'all' || u.tenantId === tenant) &&
      (role === 'all' || u.role === role) &&
      (status === 'all' || u.status === status),
  );

  const columns: Column<AdminUser>[] = [
    {
      header: '이름 · 이메일',
      cell: (u) => (
        <div>
          <p className="font-medium text-on-surface">{u.name}</p>
          <p className="text-xs text-on-surface-variant">{u.email}</p>
        </div>
      ),
    },
    { header: '소속 조직', cell: (u) => u.tenantName },
    { header: '권한', cell: (u) => <Pill tone="gray">{USER_ROLE_LABEL[u.role]}</Pill> },
    { header: '상태', cell: (u) => <Pill tone={STATUS_TONE[u.status]}>{USER_STATUS_LABEL[u.status]}</Pill> },
    { header: '가입일', cell: (u) => u.joinedAt },
    { header: '최근 로그인', cell: (u) => u.lastLoginAt ?? '—', className: 'text-on-surface-variant' },
  ];

  return (
    <AdminShell>
      <PageHeader
        title="사용자 관리"
        description="전체 테넌트 소속 사용자 계정을 조회하고 상태·권한을 관리합니다."
      />

      <FilterBar>
        <Select
          className="w-auto"
          value={tenant}
          onChange={(e) => setTenant(e.target.value)}
          options={[{ value: 'all', label: '전체 조직' }, ...TENANTS.map((t) => ({ value: t.id, label: t.name }))]}
        />
        <Select
          className="w-auto"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: 'all', label: '전체 역할' },
            { value: 'manager', label: 'Manager' },
            { value: 'member', label: 'Member' },
          ]}
        />
        <Select
          className="w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'all', label: '전체 상태' },
            { value: 'active', label: '활성' },
            { value: 'suspended', label: '정지' },
            { value: 'withdrawn', label: '탈퇴' },
          ]}
        />
        <span className="ml-auto text-sm text-on-surface-variant">총 {rows.length}명</span>
      </FilterBar>

      <Card>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(u) => u.id}
          onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
          empty={<EmptyState Icon={UserX} title="조건에 맞는 사용자가 없습니다" description="필터를 변경해 보세요." />}
        />
      </Card>
    </AdminShell>
  );
}
