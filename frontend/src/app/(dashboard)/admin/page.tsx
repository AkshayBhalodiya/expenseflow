'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { api, AdminUser, AdminExpense } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [expenses, setExpenses] = useState<AdminExpense[]>([]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    api.getAllUsers().then((res) => setUsers(res.data)).catch(console.error);
    api.getAllExpensesAdmin().then((res) => setExpenses(res.data)).catch(console.error);
  }, [user, router]);

  if (user?.role !== 'admin') return null;

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">System management and analytics</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Users</p><p className="text-3xl font-bold">{users.length}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-3xl font-bold">{expenses.length}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Amount</p><p className="text-3xl font-bold">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Users</CardTitle></CardHeader>
          <CardContent className="p-0 divide-y">
            {users.map((u) => (
              <div key={u._id} className="flex justify-between p-4">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                <span className="text-sm capitalize px-2 py-1 bg-muted rounded">{u.role}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Expenses (All Users)</CardTitle></CardHeader>
          <CardContent className="p-0 divide-y">
            {expenses.slice(0, 20).map((e) => (
              <div key={e._id} className="flex justify-between p-4">
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{e.userId?.name} · {formatDate(e.date)}</p>
                </div>
                <span className="font-semibold">{formatCurrency(e.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
  );
}
