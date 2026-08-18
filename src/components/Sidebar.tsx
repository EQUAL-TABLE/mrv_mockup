import { Bell, BookOpen, LayoutGrid, Leaf, Settings } from 'lucide-react';
import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: '프로젝트 목록', Icon: LayoutGrid, end: true },
  { to: '/guide', label: '서비스 안내', Icon: BookOpen },
  { to: '/settings', label: '설정', Icon: Settings },
];

/** 좌측 내비게이션: 로고 → 사용자+알림 → 메뉴 (구분선 없이 간격으로 구분) */
export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest px-4">
      {/* 1) 로고 + 사이트명 (살짝 아래로) */}
      <div className="flex items-center gap-2 px-1 pt-8">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
          <Leaf className="h-4 w-4 text-white" />
        </div>
        <div className="leading-tight">
          <p className="font-headline text-lg tracking-wide text-primary">COFFEE MRV</p>
          <p className="text-[11px] font-medium tracking-wide text-on-surface-variant">by EQUAL TABLE</p>
        </div>
      </div>

      {/* 2) 로그인 사용자 정보 + 알림 */}
      <div className="mt-9 flex items-center gap-2 px-1">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
          공
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-on-surface">공드리 로스터리</p>
          <p className="truncate text-xs text-on-surface-variant">Manager</p>
        </div>
        <button
          type="button"
          className="relative rounded-md p-2 text-on-surface-variant transition hover:bg-surface-container-high"
          aria-label="알림"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-error" />
        </button>
      </div>

      {/* 3) 메뉴 */}
      <nav className="mt-9 flex-1 space-y-0.5">
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition',
                isActive ? 'bg-primary/8 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
