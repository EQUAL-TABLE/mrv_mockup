import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { TrackGuide } from '@/pages/TrackGuide';
import { StartWizard } from '@/pages/project/StartWizard';
import { ProjectPage } from '@/pages/project/ProjectPage';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { Dashboard } from '@/pages/admin/Dashboard';
import { Users } from '@/pages/admin/Users';
import { UserDetail } from '@/pages/admin/UserDetail';
import { Tenants } from '@/pages/admin/Tenants';
import { TenantDetail } from '@/pages/admin/TenantDetail';
import { Factors } from '@/pages/admin/Factors';
import { FactorHistory } from '@/pages/admin/FactorHistory';
import { MasterData } from '@/pages/admin/MasterData';
import { Materials } from '@/pages/admin/Materials';
import { ReferenceData } from '@/pages/admin/ReferenceData';
import { AuditLogs } from '@/pages/admin/AuditLogs';
import { Monitoring } from '@/pages/admin/Monitoring';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 첫 사용자(프로젝트 없음) 데모 */}
        <Route path="/first" element={<Home empty />} />
        {/* 트랙 자세히 알아보기 (?track=mrv|calculator) */}
        <Route path="/guide" element={<TrackGuide />} />
        {/* 신규 프로젝트 시작 위저드 (산정 방식 → 방법론 → 산정 범위) */}
        <Route path="/start" element={<StartWizard />} />
        {/* 프로젝트 작업 화면 */}
        <Route path="/projects/:id" element={<Navigate to="basic" replace />} />
        <Route path="/projects/:id/:step" element={<ProjectPage />} />

        {/* ── 관리자 콘솔 (별도 도메인·별도 배포 가정) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/monitoring" element={<Monitoring />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/users/:userId" element={<UserDetail />} />
        <Route path="/admin/tenants" element={<Tenants />} />
        <Route path="/admin/tenants/:tenantId" element={<TenantDetail />} />
        <Route path="/admin/factors" element={<Factors />} />
        <Route path="/admin/factors/:factorId/history" element={<FactorHistory />} />
        <Route path="/admin/master-data" element={<MasterData />} />
        <Route path="/admin/materials" element={<Materials />} />
        <Route path="/admin/reference-data" element={<ReferenceData />} />
        <Route path="/admin/audit-logs" element={<AuditLogs />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
