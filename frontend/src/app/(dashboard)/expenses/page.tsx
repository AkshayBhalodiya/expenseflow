'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Camera, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, Expense, CreditCardType, HouseholdExpense } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useViewStore } from '@/store/viewStore';
import { useDebounce } from '@/hooks/use-debounce';
import { PageHeader } from '@/components/layout/page-header';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Fuel', 'Rent', 'Electricity', 'Internet', 'Mobile', 'Entertainment', 'Education', 'Medical', 'Others'];

export default function ExpensesPage() {
  const { viewMode } = useViewStore();
  const [expenses, setExpenses] = useState<(Expense | HouseholdExpense)[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const fileRef = useRef<HTMLInputElement>(null);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [form, setForm] = useState({
    title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0],
    notes: '', paymentMethod: 'cash', creditCardId: '',
  });

  const fetchExpenses = () => {
    const req = viewMode === 'household'
      ? api.getHouseholdExpenses()
      : api.getExpenses(debouncedSearch ? { search: debouncedSearch } : undefined);
    req.then((res) => setExpenses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExpenses(); }, [debouncedSearch, viewMode]);

  useEffect(() => {
    api.getCreditCards().then((res) => setCreditCards(res.data.filter((c) => c.isActive))).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Record<string, unknown> = {
        ...form,
        amount: parseFloat(form.amount),
        creditCardId: form.paymentMethod === 'card' ? form.creditCardId : undefined,
      };
      await api.createExpense(payload);
      setShowForm(false);
      setForm({ title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], notes: '', paymentMethod: 'cash', creditCardId: '' });
      fetchExpenses();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense?')) {
      await api.deleteExpense(id);
      fetchExpenses();
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.scanReceipt(file, true);
      if (res.data.extracted) {
        setForm({
          title: res.data.extracted.shopName || 'Receipt Expense',
          amount: String(res.data.extracted.amount || ''),
          category: 'Others',
          date: new Date(res.data.extracted.date).toISOString().split('T')[0],
          notes: 'From receipt scan',
          paymentMethod: 'cash',
          creditCardId: '',
        });
        setShowForm(true);
      }
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
        <PageHeader
          title="Expenses"
          description={viewMode === 'household' ? 'All home members expenses' : 'Track and manage your expenses'}
          actions={
            <>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleScan} />
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => fileRef.current?.click()}>
                <Camera className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Scan Receipt</span>
              </Button>
              <Button size="sm" className="flex-1 sm:flex-none" onClick={() => setShowForm(!showForm)}>
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </>
          }
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search expenses..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle>Add New Expense</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v, creditCardId: v !== 'card' ? '' : form.creditCardId })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['cash', 'card', 'upi', 'bank_transfer', 'other'].map((m) => (
                        <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.paymentMethod === 'card' && (
                  <div className="space-y-2">
                    <Label>Credit Card</Label>
                    {creditCards.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No cards added. <a href="/credit-cards" className="text-primary underline">Add a card</a></p>
                    ) : (
                      <Select value={form.creditCardId} onValueChange={(v) => setForm({ ...form, creditCardId: v })} required>
                        <SelectTrigger><SelectValue placeholder="Select card" /></SelectTrigger>
                        <SelectContent>
                          {creditCards.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              {c.cardName} (••••{c.lastFourDigits}) — {formatCurrency(c.availableCredit)} available
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
                <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <div className="sm:col-span-2 flex gap-2">
                  <Button type="submit">Save Expense</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : expenses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No expenses found</div>
            ) : (
              <div className="divide-y">
                {expenses.map((expense) => (
                  <div key={expense._id} className="flex items-start justify-between gap-3 p-4 hover:bg-muted/50 sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{expense.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                        {expense.category} · {formatDate(expense.date)}
                      </p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {expense.paymentMethod}
                        {'userId' in expense && expense.userId && typeof expense.userId === 'object' && expense.userId.name && (
                          <> · {expense.userId.name}</>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-semibold text-destructive text-sm sm:text-base">{formatCurrency(expense.amount)}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(expense._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
