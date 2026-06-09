'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Receipt, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/expenses': 'Expenses',
  '/income': 'Income',
  '/emi': 'EMI',
  '/credit-cards': 'Cards',
  '/household': 'Home',
  '/budgets': 'Budgets',
  '/goals': 'Goals',
  '/recurring': 'Recurring',
  '/analytics': 'Analytics',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/admin': 'Admin',
};

export function AppHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'ExpenseFlow';

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur-md pt-safe lg:hidden">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Receipt className="h-4 w-4 text-primary" />
          </span>
          <span className="truncate text-base font-bold tracking-tight">{title}</span>
        </Link>

        <Link
          href="/notifications"
          className={cn(
            'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-muted',
            pathname === '/notifications' && 'bg-primary/10 text-primary'
          )}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
