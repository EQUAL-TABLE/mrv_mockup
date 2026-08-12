import { Activity, ScanLine } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, CardTitle, Column, DataTable, PageHeader, Pill, StatCard } from '@/components/admin/ui';
import { ERROR_LOGS, ErrorLog, MONITORING_METRICS, OCR_JOBS, OcrJob } from '@/data/admin';

/** ADM-SYS-001 시스템 운영 모니터링 — OCR 처리현황·API 응답·에러로그 */
export function Monitoring() {
  const jobColumns: Column<OcrJob>[] = [
    { header: '파일명', cell: (j) => <span className="font-medium text-on-surface">{j.file}</span> },
    { header: '조직', cell: (j) => j.tenant },
    {
      header: '상태',
      cell: (j) =>
        j.status === 'done' ? (
          <Pill tone="green">완료</Pill>
        ) : j.status === 'processing' ? (
          <Pill tone="amber">처리중</Pill>
        ) : (
          <Pill tone="red">실패</Pill>
        ),
    },
    { header: '처리시간', cell: (j) => j.duration, align: 'right' },
    { header: '시각', cell: (j) => <span className="text-on-surface-variant">{j.at}</span> },
  ];

  const errorColumns: Column<ErrorLog>[] = [
    { header: '시각', cell: (e) => <span className="whitespace-nowrap text-on-surface-variant">{e.at}</span> },
    { header: '레벨', cell: (e) => (e.level === 'ERROR' ? <Pill tone="red">ERROR</Pill> : <Pill tone="amber">WARN</Pill>) },
    { header: '서비스', cell: (e) => <span className="font-mono text-xs">{e.service}</span> },
    { header: '메시지', cell: (e) => <span className="text-on-surface-variant">{e.message}</span> },
  ];

  return (
    <AdminShell>
      <PageHeader
        title="시스템 운영 모니터링"
        description="OCR 처리현황·API 응답상태·에러로그 등 운영지표를 확인하여 장애를 조기에 감지합니다."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MONITORING_METRICS.map((m) => (
          <StatCard key={m.label} label={m.label} value={m.value} sub={m.sub} tone={m.tone} Icon={Activity} />
        ))}
      </div>

      <div className="mt-5 space-y-5">
        <Card>
          <CardTitle title="OCR 처리 현황" sub="문서 1건 처리 3초 이내 성능 목표 모니터링" actions={<ScanLine className="h-4 w-4 text-on-surface-variant" />} />
          <DataTable columns={jobColumns} rows={OCR_JOBS} rowKey={(j) => j.id} />
        </Card>

        <Card>
          <CardTitle title="에러 로그" sub="최근 24시간" />
          <DataTable columns={errorColumns} rows={ERROR_LOGS} rowKey={(e) => e.at + e.service} />
        </Card>
      </div>
    </AdminShell>
  );
}
