'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MemberBreakdown } from '@/components/dashboard/member-breakdown';
import { api, Income, HouseholdIncome, MemberSummary } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useViewStore } from '@/store/viewStore';
import { useHasHousehold, useHouseholdStore } from '@/store/householdStore';
import { PageHeader } from '@/components/layout/page-header';

const SOURCES = ['salary', 'freelancing', 'business', 'investment', 'other'];

export default function IncomePage() {
  const { viewMode } = useViewStore();
  const [income, setIncome] = useState<(Income | HouseholdIncome)[]>([]);
  const hasHousehold = useHasHousehold();
  const fetchMembers = useHouseholdStore((s) => s.fetchMembers);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ source: 'salary', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  const fetchIncome = () => {
    setLoading(true);
    if (viewMode === 'household') {
      Promise.all([api.getHouseholdIncome(), fetchMembers()])
        .then(([incomeRes, memberList]) => {
          setIncome(incomeRes.data);
          setMembers(memberList);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      api.getIncome()
        .then((res) => setIncome(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => { fetchIncome(); }, [viewMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createIncome({ ...form, amount: parseFloat(form.amount) });
    setShowForm(false);
    setForm({ source: 'salary', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    fetchIncome();
  };

  const total = income.reduce((s, i) => s + i.amount, 0);
  const isHousehold = viewMode === 'household' && hasHousehold;

  return (
    <div className="space-y-6">
        <PageHeader
          title="Income"
          description={isHousehold ? `Home total: ${formatCurrency(total)}` : `Total: ${formatCurrency(total)}`}
          actions={
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" /> Add Income
            </Button>
          }
        />

        {isHousehold && members.length > 0 && (
          <MemberBreakdown members={members} combinedIncome={total} />
        )}

        {showForm && (
          <Card>
            <CardHeader><CardTitle>Add Income</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
                <div className="sm:col-span-2 flex gap-2">
                  <Button type="submit">Save</Button>
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
            ) : income.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No income records found</div>
            ) : (
              <div className="divide-y">
                {income.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium capitalize">{item.source}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(item.date)}
                        {'userId' in item && item.userId && typeof item.userId === 'object' && item.userId.name && (
                          <> · <span className="text-primary">{item.userId.name}</span></>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-green-600">{formatCurrency(item.amount)}</span>
                      {!isHousehold && (
                        <Button variant="ghost" size="icon" onClick={async () => { await api.deleteIncome(item._id); fetchIncome(); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
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
