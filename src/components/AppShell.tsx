import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';

interface AppShellProps {
  children: ReactNode;
}

/** 앱 셸: 좌측 내비 + 본문 + 신뢰 신호 푸터 (상단바 없음) */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-6">{children}</main>

        <footer className="border-t border-outline-variant px-6 py-4">
          <p className="text-xs text-on-surface-variant">
            표준 <b className="font-semibold text-on-surface">ISO 14067</b> ·{' '}
            <b className="font-semibold text-on-surface">환경성적표지</b> 기반 &nbsp;·&nbsp; 방법론 v2.1 &nbsp;·&nbsp;
            산정 결과는 검토·확정 절차를 거쳐 발급됩니다 &nbsp;·&nbsp; © EQUALTABLE
          </p>
        </footer>
      </div>
    </div>
  );
}
