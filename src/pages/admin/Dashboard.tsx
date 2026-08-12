import { Building2, Clock, FolderKanban, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, CardTitle, PageHeader, Pill, StatCard } from '@/components/admin/ui';
import {
  AUDIT_LOGS,
  AUDIT_TYPE_LABEL,
  DASHBOARD_STATS,
  EMISSION_FACTORS,
  MASTER_DATA,
} from '@/data/admin';

/** ADM-DASH-001 관리자 대시보드 (제안) — 로그인 직후 진입 화면 */
export function Dashboard() {
  const navigate = useNavigate();
  const pendingEf = EMISSION_FACTORS.filter((e) => e.state === 'pending');
  const pendingMaster = MASTER_DATA.filter((m) => m.state === 'pending');

  return (
    <AdminShell>
      <PageHeader
        title="대시보드"
        description="전체 운영 현황과 24시간 유예 중인 적용대기 항목을 한눈에 확인합니다."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="전체 테넌트" value={DASHBOARD_STATS.tenants} sub="가입 조직 수" Icon={Building2} />
        <StatCard label="활성 사용자" value={DASHBOARD_STATS.activeUsers} sub="상태 = 활성" Icon={Users} />
        <StatCard label="진행중 프로젝트" value={DASHBOARD_STATS.ongoingProjects} sub="작성·검토 단계" Icon={FolderKanban} />
        <StatCard
          label="적용대기중 항목"
          value={DASHBOARD_STATS.pendingFactors}
          sub="24시간 유예 중"
          Icon={Clock}
          tone="warn"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* 적용대기중 항목 일괄 확인 */}
        <Card>
          <CardTitle title="적용대기중 항목" sub="유예기간 중 등록 취소가 가능합니다" />
          <div className="divide-y divide-outline-variant/60">
            {[...pendingEf.map((e) => ({ id: e.id, name: e.name, kind: '배출계수', to: '/admin/factors', at: e.effectiveAt })),
              ...pendingMaster.map((m) => ({ id: m.id, name: m.name, kind: '기준데이터', to: '/admin/master-data', at: m.updatedAt }))].map(
              (item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-surface-container-low/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-on-surface">{item.name}</p>
                    <p className="mt-0.5 text-xs text-on-surface-variant">
                      {item.kind} · 적용 예정 {item.at}
                    </p>
                  </div>
                  <Pill tone="amber">대기중</Pill>
                </button>
              ),
            )}
          </div>
        </Card>

        {/* 최근 감사 로그 요약 */}
        <Card>
          <CardTitle
            title="최근 감사 로그"
            sub="관리자 조작 이력"
            actions={
              <button
                type="button"
                onClick={() => navigate('/admin/audit-logs')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                전체 보기
              </button>
            }
          />
          <div className="divide-y divide-outline-variant/60">
            {AUDIT_LOGS.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-on-surface">
                    {log.action} · {log.target}
                  </p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    {log.actor} · {log.at}
                  </p>
                </div>
                <Pill tone="gray">{AUDIT_TYPE_LABEL[log.type]}</Pill>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
