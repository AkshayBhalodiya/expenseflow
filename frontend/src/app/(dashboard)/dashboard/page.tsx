'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, PiggyBank, CreditCard, Wallet, Target, Landmark, Home } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { FinancialSummary } from '@/components/dashboard/financial-summary';
import { MemberBreakdown } from '@/components/dashboard/member-breakdown';
import {
  MonthlyExpenseChart,
  IncomeVsExpenseChart,
  CategoryPieChart,
  WeeklyTrendChart,
  DailyAreaChart,
} from '@/components/dashboard/charts-lazy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { api, DashboardData } from '@/lib/api';
import { useViewStore } from '@/store/viewStore';
import { useHasHousehold } from '@/store/householdStore';

export default function DashboardPage() {
  const { viewMode } = useViewStore();
  const hasHousehold = useHasHousehold();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.getDashboard(viewMode)
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [viewMode]);

  const isHousehold = viewMode === 'household' && data?.scope === 'household';
  const kpis = data?.kpis;
  const charts = data?.charts;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 sm:text-3xl">
          {isHousehold && <Home className="h-6 w-6 text-primary sm:h-7 sm:w-7" />}
          <span className="truncate">{isHousehold ? `${data?.household?.name || 'Home'}` : 'Dashboard'}</span>
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {isHousehold
            ? `Combined finances · ${data?.members?.length || 0} members`
            : 'Your financial overview'}
        </p>
      </div>

      {viewMode === 'household' && !hasHousehold && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-muted-foreground">Create or join a home to see combined finances</p>
            <Link href="/household"><Button><Home className="h-4 w-4 mr-2" /> Setup Home</Button></Link>
          </CardContent>
        </Card>
      )}

      {error && viewMode === 'household' && (
        <Card className="border-destructive/50">
          <CardContent className="p-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : data && (
        <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard title="Total Income" value={kpis?.totalIncome || 0} icon={TrendingUp} subtitle={isHousehold ? 'Home combined' : 'All income received'} />
            <StatCard title="Total Expenses" value={kpis?.totalExpenses || 0} icon={TrendingDown} subtitle={isHousehold ? 'Home combined' : 'All expenses paid'} />
            <StatCard title="Gross Savings" value={kpis?.grossSavings ?? kpis?.totalSavings ?? 0} icon={PiggyBank} subtitle="Income − Expenses" />
            <StatCard title="Monthly EMI" value={kpis?.monthlyEmi ?? kpis?.totalEmi ?? 0} icon={CreditCard} subtitle="Active loans (per month)" />
          </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard title="Available Balance" value={kpis?.availableBalance ?? kpis?.remainingBalance ?? 0} icon={Wallet} subtitle="After EMI" className="border-primary/30 bg-primary/5" />
            <StatCard title="Loan Outstanding" value={kpis?.loanOutstanding ?? 0} icon={Landmark} subtitle="Principal left" />
            {isHousehold ? (
              <>
                <StatCard title="Card Used" value={kpis?.cardUsed ?? 0} icon={CreditCard} subtitle="All cards combined" />
                <StatCard title="Card Utilization" value={kpis?.cardUtilization ?? 0} icon={Target} format="percent" subtitle="Of total limit" />
              </>
            ) : (
              <>
                <StatCard title="EMI Paid (Total)" value={kpis?.totalEmiPaid ?? 0} icon={CreditCard} subtitle="Installments paid" />
                <StatCard title="Budget Usage" value={kpis?.budgetUsage || 0} icon={Target} format="percent" subtitle="This month" />
              </>
            )}
          </div>

          {isHousehold && data.members && (
            <MemberBreakdown members={data.members} combinedIncome={kpis?.totalIncome || 0} />
          )}

          {!isHousehold && (
            <FinancialSummary
              totalIncome={kpis?.totalIncome || 0}
              totalExpenses={kpis?.totalExpenses || 0}
              grossSavings={kpis?.grossSavings ?? kpis?.totalSavings ?? 0}
              monthlyEmi={kpis?.monthlyEmi ?? kpis?.totalEmi ?? 0}
              availableBalance={kpis?.availableBalance ?? kpis?.remainingBalance ?? 0}
              loanOutstanding={kpis?.loanOutstanding ?? 0}
              totalEmiPaid={kpis?.totalEmiPaid ?? 0}
            />
          )}

          {!isHousehold && (
            <Card>
              <CardHeader><CardTitle className="text-base">Current Month Budget Usage</CardTitle></CardHeader>
              <CardContent>
                <Progress value={kpis?.budgetUsage || 0} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">{kpis?.budgetUsage || 0}% of monthly budget used</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Monthly Expense Trend</CardTitle></CardHeader>
              <CardContent><MonthlyExpenseChart data={charts?.monthlyTrend || []} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Income vs Expense</CardTitle></CardHeader>
              <CardContent><IncomeVsExpenseChart data={charts?.incomeVsExpense || { income: 0, expense: 0 }} /></CardContent>
            </Card>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle>Category-wise Expense</CardTitle></CardHeader>
              <CardContent><CategoryPieChart data={charts?.categoryWise || []} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Weekly Expense Trend</CardTitle></CardHeader>
              <CardContent><WeeklyTrendChart data={charts?.weeklyTrend || []} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Daily Expense Trend</CardTitle></CardHeader>
              <CardContent><DailyAreaChart data={charts?.dailyTrend || []} /></CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
