'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { AppHeader } from './app-header';
import { BottomNav } from './bottom-nav';
import { ViewToggle } from './view-toggle';
import { useAuthStore } from '@/store/authStore';
import { useHasHousehold, useHouseholdStore } from '@/store/householdStore';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, fetchProfile } = useAuthStore();
  const hasHousehold = useHasHousehold();
  const fetchHousehold = useHouseholdStore((s) => s.fetchHousehold);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token && !isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchProfile();
    fetchHousehold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 lg:bg-background">
      <Sidebar />
      <AppHeader />
      <BottomNav />

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 pb-nav pt-header lg:px-6 lg:pb-6 lg:pt-6">
          {hasHousehold && (
            <div className="mb-4 lg:flex lg:justify-end">
              <ViewToggle hasHousehold={hasHousehold} />
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
