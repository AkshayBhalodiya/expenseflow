'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, Budget } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Fuel', 'Rent', 'Electricity', 'Internet', 'Mobile', 'Entertainment', 'Education', 'Medical', 'Others'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showForm, setShowForm] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({
    category: 'Food', amount: '', month: MONTHS[now.getMonth()], year: now.getFullYear(),
  });

  const fetchBudgets = () => {
    api.getBudgets().then((res) => setBudgets(res.data)).catch(console.error);
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createBudget({ ...form, amount: parseFloat(form.amount), year: parseInt(String(form.year), 10) });
    setShowForm(false);
    fetchBudgets();
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Budget Planning</h1>
            <p className="text-muted-foreground">Set and track monthly budgets</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> Add Budget</Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle>Create Budget</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={form.month} onValueChange={(v) => setForm({ ...form, month: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Year</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) })} required /></div>
                <div className="sm:col-span-2"><Button type="submit">Save Budget</Button></div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget._id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{budget.category}</CardTitle>
                <Button variant="ghost" size="icon" onClick={async () => { await api.deleteBudget(budget._id); fetchBudgets(); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2">
                  <span>{formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}</span>
                  <span className={budget.usagePercent >= 90 ? 'text-destructive' : budget.usagePercent >= 80 ? 'text-yellow-600' : ''}>
                    {budget.usagePercent}%
                  </span>
                </div>
                <Progress value={Math.min(budget.usagePercent, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Remaining: {formatCurrency(budget.remaining)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  );
}
