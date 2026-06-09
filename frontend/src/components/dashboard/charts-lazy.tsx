'use client';

import dynamic from 'next/dynamic';
import { ChartSkeleton } from './chart-skeleton';

export const MonthlyExpenseChart = dynamic(
  () => import('./charts').then((m) => ({ default: m.MonthlyExpenseChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const IncomeVsExpenseChart = dynamic(
  () => import('./charts').then((m) => ({ default: m.IncomeVsExpenseChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const CategoryPieChart = dynamic(
  () => import('./charts').then((m) => ({ default: m.CategoryPieChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const WeeklyTrendChart = dynamic(
  () => import('./charts').then((m) => ({ default: m.WeeklyTrendChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

export const DailyAreaChart = dynamic(
  () => import('./charts').then((m) => ({ default: m.DailyAreaChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
