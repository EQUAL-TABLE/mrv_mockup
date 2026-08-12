import { ArrowLeft, Lock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, CardTitle, DefRow, PageHeader, Pill } from '@/components/admin/ui';
import { InfoBanner } from '@/components/ui/form';
import { DQI_CRITERIA, EF_VERSIONS, EMISSION_FACTORS } from '@/data/admin';

/** ADM-EF-003 배출계수 버전 이력 조회 — 시계열 조회, 이력 삭제·직접수정 불가 */
export function FactorHistory() {
  const { factorId } = useParams();
  const navigate = useNavigate();
  const factor = EMISSION_FACTORS.find((e) => e.id === factorId) ?? EMISSION_FACTORS[0];

  return (
    <AdminShell>
      <button
        type="button"
        onClick={() => navigate('/admin/factors')}
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-on-surface-variant transition hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> 배출계수 목록
      </button>

      <PageHeader title={factor.name} description="전체 버전 이력을 시계열로 조회합니다." />

      <InfoBanner>
        <span className="inline-flex items-center gap-1">
          <Lock className="h-3.5 w-3.5" />
          이력은 <b className="font-semibold text-on-surface">삭제 불가</b>(감사 목적)하며, 레코드 직접 수정은 불가능합니다. 신규
          버전 등록만 가능합니다.
        </span>
      </InfoBanner>

      {/* 타임라인 */}
      <div className="mt-5 space-y-4">
        {EF_VERSIONS.map((v, idx) => (
          <div key={v.version} className="relative pl-7">
            {/* 세로선 */}
            {idx < EF_VERSIONS.length - 1 && (
              <span className="absolute left-[9px] top-6 h-full w-px bg-outline-variant" />
            )}
            {/* 노드 */}
            <span
              className={`absolute left-0 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${
                v.current ? 'border-primary bg-primary' : 'border-outline-variant bg-surface-container-lowest'
              }`}
            />
            <Card>
              <CardTitle
                title={`${v.version} · ${v.value} ${v.unit}`}
                sub={`${v.changedAt} · ${v.changedBy}`}
                actions={v.current ? <Pill tone="green">현재버전</Pill> : <Pill tone="gray">이력</Pill>}
              />
              <div className="grid gap-x-6 px-5 py-1 sm:grid-cols-2">
                <DefRow label="변경 사유">{v.reason}</DefRow>
                <DefRow label="출처">{v.source}</DefRow>
                <DefRow label="DQI 종합">{v.dqi.toFixed(1)}</DefRow>
                <DefRow label="데이터 품질 근거">
                  <div className="flex flex-wrap gap-1">
                    {DQI_CRITERIA.map((c) => (
                      <Pill key={c.key} tone="gray">
                        {c.label}
                      </Pill>
                    ))}
                  </div>
                </DefRow>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
