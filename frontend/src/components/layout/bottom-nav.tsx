'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  WalletCards,
  MoreHorizontal,
  CreditCard,
  Home,
  PiggyBank,
  Target,
  RefreshCw,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Users,
  Moon,
  Sun,
  LogOut,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const primaryTabs = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/income', label: 'Income', icon: TrendingUp },
  { href: '/credit-cards', label: 'Cards', icon: WalletCards },
];

const moreItems = [
  { href: '/emi', label: 'EMI', icon: CreditCard },
  { href: '/household', label: 'Home Share', icon: Home },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/recurring', label: 'Recurring', icon: RefreshCw },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const moreHrefs = new Set(moreItems.map((i) => i.href));

function isPrimaryActive(pathname: string, href: string) {
  return pathname === href || (href === '/dashboard' && pathname === '/');
}

function isMoreActive(pathname: string) {
  return moreHrefs.has(pathname) || pathname === '/admin';
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [moreOpen, setMoreOpen] = useState(false);

  const allMore = user?.role === 'admin'
    ? [...moreItems, { href: '/admin', label: 'Admin', icon: Users }]
    : moreItems;

  const handleLogout = async () => {
    setMoreOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden
        />
      )}

      {moreOpen && (
      <div className="fixed inset-x-0 bottom-16 z-50 mx-auto max-w-lg px-3 lg:hidden">
        <div className="pointer-events-auto mx-auto max-h-[75vh] max-w-lg overflow-hidden rounded-t-2xl border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="font-semibold">More</p>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="rounded-full p-2 hover:bg-muted"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-4">
            {allMore.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl p-3 text-center text-xs font-medium transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="line-clamp-2 leading-tight">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-1 border-t p-4">
            <div className="px-2 py-1 text-sm">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-muted"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-md pb-safe lg:hidden">
        <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-1">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isPrimaryActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium sm:text-xs',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <span className={cn('rounded-xl p-1.5', active && 'bg-primary/10')}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium sm:text-xs',
              isMoreActive(pathname) ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <span className={cn('rounded-xl p-1.5', isMoreActive(pathname) && 'bg-primary/10')}>
              <MoreHorizontal className="h-5 w-5" />
            </span>
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
