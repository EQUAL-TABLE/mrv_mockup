import { AlertCircle, ArrowLeft, Ban, Eye, FileText, ScanLine } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, CardTitle, Column, DataTable, DefRow, Modal, PageHeader, Pill, Tabs } from '@/components/admin/ui';
import { Button } from '@/components/ui/Button';
import { FormField, Select, Textarea } from '@/components/ui/form';
import {
  ADMIN_USERS,
  AdminUser,
  PROJECT_AUDIT,
  ProjectAuditItem,
  TENANT_DOCS,
  TENANT_STATUS_LABEL,
  TENANTS,
  TenantDoc,
  USER_ROLE_LABEL,
} from '@/data/admin';

const TABS = [
  { key: 'info', label: '조직 정보' },
  { key: 'users', label: '소속 사용자' },
  { key: 'docs', label: '업로드 문서' },
  { key: 'audit', label: '프로젝트 감사 이력' },
];

/** ADM-TENANT-002 테넌트 상세 조회·관리 (하위 탭: ADM-LOG-002 프로젝트 감사 이력) */
export function TenantDetail() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const tenant = TENANTS.find((t) => t.id === tenantId) ?? TENANTS[0];
  const members = ADMIN_USERS.filter((u) => u.tenantId === tenant.id);

  const [tab, setTab] = useState('info');
  const [suspendModal, setSuspendModal] = useState(false);
  const [docModal, setDocModal] = useState<TenantDoc | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const userColumns: Column<AdminUser>[] = [
    { header: '이름', cell: (u) => <span className="font-medium text-on-surface">{u.name}</span> },
    { header: '이메일', cell: (u) => u.email },
    { header: '권한', cell: (u) => <Pill tone="gray">{USER_ROLE_LABEL[u.role]}</Pill> },
    { header: '상태', cell: (u) => (u.status === 'active' ? <Pill tone="green">활성</Pill> : <Pill tone="amber">정지/탈퇴</Pill>) },
  ];

  const docColumns: Column<TenantDoc>[] = [
    { header: '파일명', cell: (d) => <span className="font-medium text-on-surface">{d.name}</span> },
    { header: '문서 종류', cell: (d) => d.type },
    { header: '업로드일', cell: (d) => d.uploadedAt },
    {
      header: 'OCR 상태',
      cell: (d) =>
        d.ocrStatus === 'done' ? (
          <Pill tone="green">완료</Pill>
        ) : d.ocrStatus === 'processing' ? (
          <Pill tone="amber">처리중</Pill>
        ) : (
          <Pill tone="red">실패</Pill>
        ),
    },
    {
      header: '',
      align: 'right',
      cell: (d) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDocModal(d);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Eye className="h-3.5 w-3.5" /> 원본 열람
        </button>
      ),
    },
  ];

  const auditColumns: Column<ProjectAuditItem>[] = [
    { header: '일시', cell: (a) => a.at, className: 'whitespace-nowrap text-on-surface-variant' },
    { header: '조작자', cell: (a) => a.actor },
    { header: '유형', cell: (a) => <Pill tone="gray">{a.action}</Pill> },
    { header: '대상 프로젝트', cell: (a) => a.target },
    { header: '내용', cell: (a) => <span className="text-on-surface-variant">{a.detail}</span> },
  ];

  return (
    <AdminShell>
      <button
        type="button"
        onClick={() => navigate('/admin/tenants')}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-on-surface-variant transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> 조직 목록
      </button>

      <PageHeader
        title={tenant.name}
        description={`사업자등록번호 ${tenant.bizNo}`}
        actions={
          <>
            <Pill tone={tenant.status === 'active' ? 'green' : 'amber'}>{TENANT_STATUS_LABEL[tenant.status]}</Pill>
            {tenant.status === 'active' && (
              <Button variant="secondary" size="sm" onClick={() => setSuspendModal(true)}>
                <Ban className="h-4 w-4" /> 조직 정지
              </Button>
            )}
          </>
        }
      />

      <Tabs items={TABS} value={tab} onChange={setTab} />

      <div className="mt-5">
        {tab === 'info' && (
          <Card>
            <CardTitle title="OCR 추출 사업자 정보" sub="회원가입 시 사업자등록증에서 자동 추출" />
            <div className="divide-y divide-outline-variant/60 px-5">
              <DefRow label="사업장명">{tenant.name}</DefRow>
              <DefRow label="사업자등록번호">
                <span className="font-mono">{tenant.bizNo}</span>
              </DefRow>
              <DefRow label="주소">{tenant.address}</DefRow>
              <DefRow label="대표담당자">{tenant.owner}</DefRow>
              <DefRow label="소속 사용자">{tenant.userCount}명</DefRow>
              <DefRow label="프로젝트">{tenant.projectCount}건</DefRow>
              <DefRow label="가입일">{tenant.joinedAt}</DefRow>
            </div>
          </Card>
        )}

        {tab === 'users' && (
          <Card>
            <CardTitle title="소속 사용자" sub="행 클릭 시 사용자 상세로 이동" />
            <DataTable
              columns={userColumns}
              rows={members}
              rowKey={(u) => u.id}
              onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
            />
          </Card>
        )}

        {tab === 'docs' && (
          <Card>
            <CardTitle title="업로드 문서" sub="원본 열람은 사유 입력 필수 · 즉시 감사 로그 기록 + 고객사 사후 알림" />
            <DataTable columns={docColumns} rows={TENANT_DOCS} rowKey={(d) => d.name} />
          </Card>
        )}

        {tab === 'audit' && (
          <Card>
            <CardTitle
              title="프로젝트 감사 이력"
              sub="ADM-LOG-002 · 제3자 검증기관 대응 및 내부감사용 전체 변경 이력"
            />
            <DataTable columns={auditColumns} rows={PROJECT_AUDIT} rowKey={(a) => a.at + a.action} />
          </Card>
        )}
      </div>

      {/* 조직 정지 모달 */}
      <Modal
        open={suspendModal}
        onClose={() => setSuspendModal(false)}
        title="조직 정지"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setSuspendModal(false)}>
              취소
            </Button>
            <Button
              size="sm"
              className="bg-error hover:bg-error/90"
              onClick={() => {
                setSuspendModal(false);
                flash('조직을 정지 처리했습니다.');
              }}
            >
              정지 확정
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed text-warning">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>정지 시 소속 사용자 전체가 로그인할 수 없게 됩니다. 진행 중 프로젝트에는 영향이 없습니다.</span>
        </div>
        <FormField label="정지 사유" className="mt-3">
          <Textarea rows={3} placeholder="정지 사유 (감사 로그에 기록됩니다)" />
        </FormField>
      </Modal>

      {/* 원본 문서 열람 모달 */}
      <Modal
        open={!!docModal}
        onClose={() => setDocModal(null)}
        title="원본 문서 열람"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDocModal(null)}>
              취소
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setDocModal(null);
                flash('원본을 열람했습니다. 감사 로그 기록 및 고객사 알림이 발송되었습니다.');
              }}
            >
              <Eye className="h-4 w-4" /> 사유 확인 후 열람
            </Button>
          </>
        }
      >
        <div className="mb-3 flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-low p-3 text-sm">
          <FileText className="h-4 w-4 text-on-surface-variant" />
          <span className="font-medium text-on-surface">{docModal?.name}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-primary">
            <ScanLine className="h-3.5 w-3.5" /> PII 마스킹 완료본
          </span>
        </div>
        <FormField label="열람 사유" required help="원본은 PII 마스킹(OCR-006) 완료 후 저장본입니다. 마스킹 이전 이미지는 서버에 존재하지 않습니다.">
          <Select
            options={[
              { value: 'ocr', label: 'OCR 오류 확인' },
              { value: 'etc', label: '기타' },
            ]}
          />
        </FormField>
        <FormField label="상세 사유" className="mt-3">
          <Textarea rows={2} placeholder="상세 사유 입력" />
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
