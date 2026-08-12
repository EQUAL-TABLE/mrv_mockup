import {
  Boxes,
  Database,
  FileClock,
  Gauge,
  LayoutDashboard,
  LogOut,
  Building2,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Workflow,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  end?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    title: '운영',
    items: [
      { to: '/admin', label: '대시보드', Icon: LayoutDashboard, end: true },
      { to: '/admin/monitoring', label: '시스템 모니터링', Icon: Gauge },
    ],
  },
  {
    title: '회원·조직',
    items: [
      { to: '/admin/users', label: '사용자 관리', Icon: Users },
      { to: '/admin/tenants', label: '조직(테넌트) 관리', Icon: Building2 },
    ],
  },
  {
    title: '데이터',
    items: [
      { to: '/admin/factors', label: '배출계수(EF) 관리', Icon: Boxes },
      { to: '/admin/master-data', label: '기준 데이터 관리', Icon: Database },
      { to: '/admin/materials', label: '물질·매핑 데이터', Icon: Workflow },
      { to: '/admin/reference-data', label: '참조 데이터셋', Icon: SlidersHorizontal },
    ],
  },
  {
    title: '감사',
    items: [
      { to: '/admin/audit-logs', label: '감사 로그', Icon: FileClock },
    ],
  },
];

/** 관리자 사이트 셸 — 사용자 사이트와 구분되는 다크 사이드바 (별도 도메인·별도 배포) */
export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-[#111827] px-3 text-slate-300">
        {/* 로고 */}
        <div className="flex items-center gap-2 px-2 pt-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <ShieldCheck className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="font-headline text-lg tracking-wide text-white">EQUALTABLE</p>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-fixed">Admin Console</p>
          </div>
        </div>

        {/* 관리자 계정 */}
        <div className="mt-6 flex items-center gap-2 rounded-md bg-white/5 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/20 text-sm font-semibold text-primary-fixed">
            A
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">admin</p>
            <p className="truncate text-[11px] text-slate-400">Super Admin</p>
          </div>
        </div>

        {/* 메뉴 */}
        <nav className="mt-4 flex-1 space-y-4 overflow-y-auto pb-4">
          {NAV.map((group) => (
            <div key={group.title}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map(({ to, label, Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition',
                        isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white',
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* 로그아웃 */}
        <button
          type="button"
          onClick={() => navigate('/admin/login')}
          className="mb-4 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-8 py-7">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
        <footer className="border-t border-outline-variant px-8 py-4">
          <p className="text-xs text-on-surface-variant">
            <b className="font-semibold text-on-surface">관리자 콘솔</b> · 전 기능 Super Admin 권한 · 일반 사용자 접근 불가 · 모든
            조작은 감사 로그에 영구 기록됩니다 · © EQUALTABLE
          </p>
        </footer>
      </div>
    </div>
  );
}
