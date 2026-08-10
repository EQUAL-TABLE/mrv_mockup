import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { TrackGuide } from '@/pages/TrackGuide';
import { StartWizard } from '@/pages/project/StartWizard';
import { ProjectPage } from '@/pages/project/ProjectPage';

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
