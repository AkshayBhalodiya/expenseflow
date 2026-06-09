'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryPieChart } from '@/components/dashboard/charts-lazy';
import { api, AnalyticsData } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.getAnalytics().then((res) => setAnalytics(res.data)).catch(console.error);
  }, []);

  const growthItems = [
    { label: 'Expense Growth', value: analytics?.expenseGrowth || 0, icon: TrendingDown, invert: true },
    { label: 'Savings Growth', value: analytics?.savingsGrowth || 0, icon: PiggyBank, invert: false },
    { label: 'Income Growth', value: analytics?.incomeGrowth || 0, icon: TrendingUp, invert: false },
    { label: 'EMI Ratio', value: analytics?.emiRatio || 0, icon: CreditCard, invert: true, suffix: '%' },
  ];

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Deep insights into your finances</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {growthItems.map((item) => {
            const Icon = item.icon;
            const isPositive = item.invert ? item.value < 0 : item.value > 0;
            return (
              <Card key={item.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : item.value === 0 ? '' : 'text-red-600'}`}>
                        {item.value > 0 ? '+' : ''}{item.value}{item.suffix || '%'}
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Month Savings: {formatCurrency(analytics?.currentMonthSavings || 0)}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Spending Categories</CardTitle></CardHeader>
          <CardContent>
            <CategoryPieChart data={analytics?.topSpendingCategories || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Category Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.topSpendingCategories?.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span>{cat.category}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{cat.percentage}%</span>
                    <span className="font-medium">{formatCurrency(cat.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
