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
            <b className="font-semibold text-on-surface">© EQUALTABLE</b>
          </p>
        </footer>
      </div>
    </div>
  );
}
