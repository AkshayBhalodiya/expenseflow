'use client';

import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  CreditCard,
  WalletCards,
  PiggyBank,
  Target,
  RefreshCw,
  Home,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Users,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/income', label: 'Income', icon: TrendingUp },
  { href: '/emi', label: 'EMI', icon: CreditCard },
  { href: '/credit-cards', label: 'Credit Cards', icon: WalletCards },
  { href: '/household', label: 'Home', icon: Home },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/recurring', label: 'Recurring', icon: RefreshCw },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const adminItems = [{ href: '/admin', label: 'Admin', icon: Users }];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const items = user?.role === 'admin' ? [...navItems, ...adminItems] : navItems;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-64 flex-col border-r bg-background shadow-sm lg:flex">
      <div className="flex h-[4.5rem] shrink-0 items-center border-b bg-background px-5">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 font-bold text-lg tracking-tight">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </span>
          <span className="truncate">ExpenseFlow</span>
        </Link>
      </div>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-thin">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-2 border-t bg-background p-4">
        <div className="px-3 py-2 text-sm">
          <p className="font-medium truncate">{user?.name}</p>
          <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
