'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCw, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, RecurringTransaction } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Fuel', 'Rent', 'Electricity', 'Internet', 'Mobile', 'Entertainment', 'Education', 'Medical', 'Others'];
const SOURCES = ['salary', 'freelancing', 'business', 'investment', 'other'];

export default function RecurringPage() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'expense' as 'expense' | 'income',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    title: '',
    amount: '',
    category: 'Food',
    source: 'salary',
    paymentMethod: 'cash',
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const fetchItems = () => {
    api.getRecurring().then((res) => setItems(res.data)).catch(console.error);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createRecurring({
      ...form,
      amount: parseFloat(form.amount),
      endDate: form.endDate || undefined,
    });
    setShowForm(false);
    setForm({
      type: 'expense', frequency: 'monthly', title: '', amount: '',
      category: 'Food', source: 'salary', paymentMethod: 'cash', notes: '',
      startDate: new Date().toISOString().split('T')[0], endDate: '',
    });
    fetchItems();
  };

  const handleToggle = async (id: string) => {
    await api.toggleRecurring(id);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this recurring transaction?')) {
      await api.deleteRecurring(id);
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Recurring Transactions</h1>
            <p className="text-muted-foreground">Automate daily, weekly, monthly, or yearly entries</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" /> Add Recurring
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle>New Recurring Transaction</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v: 'expense' | 'income') => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={form.frequency} onValueChange={(v: typeof form.frequency) => setForm({ ...form, frequency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['daily', 'weekly', 'monthly', 'yearly'].map((f) => (
                        <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                {form.type === 'expense' ? (
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
                <div className="space-y-2"><Label>End Date (optional)</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
                <div className="sm:col-span-2 flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {items.length === 0 ? (
            <Card className="md:col-span-2">
              <CardContent className="p-8 text-center text-muted-foreground">
                <RefreshCw className="h-10 w-10 mx-auto mb-2 opacity-50" />
                No recurring transactions yet
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item._id} className={!item.isActive ? 'opacity-60' : ''}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{item.type} · {item.frequency}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleToggle(item._id)}>
                      {item.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span className={`font-semibold ${item.type === 'income' ? 'text-green-600' : 'text-destructive'}`}>
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between"><span>Next run</span><span>{formatDate(item.nextRunDate)}</span></div>
                  {item.lastRunDate && <div className="flex justify-between"><span>Last run</span><span>{formatDate(item.lastRunDate)}</span></div>}
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className={item.isActive ? 'text-green-600' : 'text-muted-foreground'}>{item.isActive ? 'Active' : 'Paused'}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
  );
}
