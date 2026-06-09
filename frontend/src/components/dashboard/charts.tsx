'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

interface ChartProps {
  data: Record<string, unknown>[];
}

export function MonthlyExpenseChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" />
        <YAxis className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
        <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Expenses']} />
        <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function IncomeVsExpenseChart({ data }: { data: { income: number; expense: number } }) {
  const chartData = [{ name: 'Overview', income: data.income, expense: data.expense }];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
        <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
        <Legend />
        <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="amount"
          nameKey="category"
          label={({ category, percentage }) => `${category} ${percentage}%`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function WeeklyTrendChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="day" />
        <YAxis tickFormatter={(v) => `₹${v}`} />
        <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
        <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DailyAreaChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tickFormatter={(d) => new Date(d).getDate().toString()} />
        <YAxis tickFormatter={(v) => `₹${v}`} />
        <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
        <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
