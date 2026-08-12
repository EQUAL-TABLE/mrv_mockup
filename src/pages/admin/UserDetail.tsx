import { ArrowLeft, KeyRound, ShieldAlert, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, CardTitle, Column, DataTable, DefRow, Modal, PageHeader, Pill } from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';
import { FormField, Select, Textarea } from '@/components/ui/form';
import {
  ADMIN_USERS,
  LoginHistory,
  USER_LOGIN_HISTORY,
  USER_ROLE_LABEL,
  USER_STATUS_LABEL,
  UserRole,
  UserStatus,
} from '@/data/admin';

const STATUS_TONE: Record<UserStatus, 'green' | 'amber' | 'gray'> = {
  active: 'green',
  suspended: 'amber',
  withdrawn: 'gray',
};

/** ADM-USER-002 사용자 상세 조회·수정 */
export function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const user = ADMIN_USERS.find((u) => u.id === userId) ?? ADMIN_USERS[0];

  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [pwModal, setPwModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const historyColumns: Column<LoginHistory>[] = [
    { header: '일시', cell: (h) => h.at },
    { header: 'IP', cell: (h) => <span className="font-mono text-xs">{h.ip}</span> },
    { header: '기기', cell: (h) => h.device },
    {
      header: '결과',
      cell: (h) => (h.result === 'success' ? <Pill tone="green">성공</Pill> : <Pill tone="red">실패</Pill>),
    },
  ];

  return (
    <AdminShell>
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-on-surface-variant transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> 사용자 목록
      </button>

      <PageHeader
        title={user.name}
        description={user.email}
        actions={<Pill tone={STATUS_TONE[status]}>{USER_STATUS_LABEL[status]}</Pill>}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* 좌: 기본 정보 + 역할 변경 */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardTitle title="기본 정보" />
            <div className="divide-y divide-outline-variant/60 px-5">
              <DefRow label="이름">{user.name}</DefRow>
              <DefRow label="이메일">{user.email}</DefRow>
              <DefRow label="소속 조직">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/tenants/${user.tenantId}`)}
                  className="text-primary hover:underline"
                >
                  {user.tenantName}
                </button>
              </DefRow>
              <DefRow label="가입일">{user.joinedAt}</DefRow>
              <DefRow label="최근 로그인">{user.lastLoginAt ?? '—'}</DefRow>
            </div>
          </Card>

          <Card>
            <CardTitle title="로그인 이력" sub="일시 · IP · 기기" />
            <DataTable columns={historyColumns} rows={USER_LOGIN_HISTORY} rowKey={(h) => h.at + h.result} />
          </Card>
        </div>

        {/* 우: 계정 관리 */}
        <div className="space-y-5">
          <Card>
            <CardTitle title="역할 변경" sub="변경 즉시 반영" />
            <div className="px-5 py-4">
              <FormField label="권한">
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  options={[
                    { value: 'manager', label: 'Manager' },
                    { value: 'member', label: 'Member' },
                  ]}
                />
              </FormField>
              <Button
                size="sm"
                className="mt-3 w-full"
                onClick={() => flash(`역할을 ${USER_ROLE_LABEL[role]}(으)로 변경했습니다.`)}
              >
                <UserCheck className="h-4 w-4" /> 역할 저장
              </Button>
            </div>
          </Card>

          <Card>
            <CardTitle title="계정 조치" />
            <div className="space-y-2 px-5 py-4">
              <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setPwModal(true)}>
                <KeyRound className="h-4 w-4" /> 비밀번호 초기화 (링크 발송)
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => setStatusModal(true)}>
                <ShieldAlert className="h-4 w-4" /> 활성화 · 정지 · 탈퇴 처리
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* 비밀번호 초기화 모달 */}
      <Modal
        open={pwModal}
        onClose={() => setPwModal(false)}
        title="비밀번호 초기화"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPwModal(false)}>
              취소
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setPwModal(false);
                flash('비밀번호 재설정 링크를 발송했습니다.');
              }}
            >
              재설정 링크 발송
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-on-surface-variant">
          <b className="text-on-surface">{user.email}</b> 로 비밀번호 재설정 링크를 발송합니다. 사용자가 링크를 통해 직접 새
          비밀번호를 설정합니다.
        </p>
      </Modal>

      {/* 상태 변경 모달 */}
      <Modal
        open={statusModal}
        onClose={() => setStatusModal(false)}
        title="계정 상태 변경"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setStatusModal(false)}>
              취소
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setStatusModal(false);
                flash(`계정 상태를 ${USER_STATUS_LABEL[status]}(으)로 변경했습니다.`);
              }}
            >
              변경 확정
            </Button>
          </>
        }
      >
        <FormField label="변경할 상태">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus)}
            options={[
              { value: 'active', label: '활성' },
              { value: 'suspended', label: '정지' },
              { value: 'withdrawn', label: '탈퇴' },
            ]}
          />
        </FormField>
        <FormField label="사유" className="mt-3">
          <Textarea rows={3} placeholder="상태 변경 사유 (감사 로그에 기록됩니다)" />
        </FormField>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-on-surface px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </AdminShell>
  );
}
