'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { MemberBreakdown } from '@/components/dashboard/member-breakdown';
import { api, EMI, EMIDashboard, HouseholdEMI, MemberSummary } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useViewStore } from '@/store/viewStore';
import { useAuthStore } from '@/store/authStore';
import { useHasHousehold, useHouseholdStore } from '@/store/householdStore';

export default function EMIPage() {
  const { viewMode } = useViewStore();
  const { user } = useAuthStore();
  const currentUserId = user?._id || user?.id;
  const [emis, setEmis] = useState<(EMI | HouseholdEMI)[]>([]);
  const [dashboard, setDashboard] = useState<EMIDashboard | null>(null);
  const hasHousehold = useHasHousehold();
  const fetchMembers = useHouseholdStore((s) => s.fetchMembers);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    loanName: '', totalAmount: '', interestRate: '0', startDate: '', endDate: '',
    emiAmount: '', totalInstallments: '',
  });

  const isHousehold = viewMode === 'household' && hasHousehold;

  const householdStats = useMemo(() => {
    const active = emis.filter((e) => e.isActive);
    const totalLoanAmount = emis.reduce((s, e) => s + e.totalAmount, 0);
    const totalPaid = emis.reduce((s, e) => s + e.paidInstallments * e.emiAmount, 0);
    const remainingBalance = emis.reduce((s, e) => s + e.remainingBalance, 0);
    const upcoming = active.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];
    return { totalLoanAmount, totalPaid, remainingBalance, upcomingEmi: upcoming };
  }, [emis]);

  const fetchData = () => {
    if (viewMode === 'household') {
      Promise.all([api.getHouseholdEMIs(), fetchMembers()])
        .then(([emisRes, memberList]) => {
          setEmis(emisRes.data);
          setMembers(memberList);
          setDashboard(null);
        })
        .catch(console.error);
    } else {
      Promise.all([api.getEMIs(), api.getEMIDashboard()])
        .then(([emisRes, dashRes]) => {
          setEmis(emisRes.data);
          setDashboard(dashRes.data);
        })
        .catch(console.error);
    }
  };

  useEffect(() => { fetchData(); }, [viewMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createEMI({
      loanName: form.loanName,
      totalAmount: parseFloat(form.totalAmount),
      interestRate: parseFloat(form.interestRate),
      startDate: form.startDate,
      endDate: form.endDate,
      emiAmount: parseFloat(form.emiAmount),
      totalInstallments: parseInt(form.totalInstallments, 10),
    });
    setShowForm(false);
    fetchData();
  };

  const stats = isHousehold ? householdStats : dashboard;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">EMI Management</h1>
            <p className="text-muted-foreground">
              {isHousehold ? 'All home members loans combined' : 'Track your loan payments'}
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> Add EMI</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Loan Amount" value={stats?.totalLoanAmount || 0} icon={CreditCard} subtitle={isHousehold ? 'Home combined' : 'Original loan value'} />
          <StatCard title="EMI Paid" value={stats?.totalPaid || 0} icon={CheckCircle} subtitle="Installments paid so far" />
          <StatCard title="Loan Outstanding" value={stats?.remainingBalance || 0} icon={CreditCard} subtitle="Principal left (reduces on pay)" />
          <StatCard title="Next EMI Due" value={(isHousehold ? householdStats.upcomingEmi?.emiAmount : dashboard?.upcomingEmi?.amount) || 0} icon={CreditCard} subtitle="Upcoming installment" />
        </div>

        {isHousehold && members.length > 0 && (
          <MemberBreakdown members={members} combinedIncome={members.reduce((s, m) => s + m.totalIncome, 0)} />
        )}

        {showForm && (
          <Card>
            <CardHeader><CardTitle>Add EMI</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Loan Name</Label><Input value={form.loanName} onChange={(e) => setForm({ ...form, loanName: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Total Amount</Label><Input type="number" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} required /></div>
                <div className="space-y-2"><Label>EMI Amount</Label><Input type="number" value={form.emiAmount} onChange={(e) => setForm({ ...form, emiAmount: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Interest Rate (%)</Label><Input type="number" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} /></div>
                <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
                <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Total Installments</Label><Input type="number" value={form.totalInstallments} onChange={(e) => setForm({ ...form, totalInstallments: e.target.value })} required /></div>
                <div className="sm:col-span-2"><Button type="submit">Save EMI</Button></div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {emis.map((emi) => {
            const emiUserId = 'userId' in emi && emi.userId
              ? (typeof emi.userId === 'object' ? (emi.userId as { _id?: string })._id : String(emi.userId))
              : undefined;
            const owner = 'userId' in emi && emi.userId && typeof emi.userId === 'object' ? emi.userId.name : undefined;
            const isOwnEmi = !isHousehold || (currentUserId && emiUserId === currentUserId);
            return (
              <Card key={emi._id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{emi.loanName}</span>
                    {owner && <span className="text-sm font-normal text-primary">{owner}</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm"><span>EMI Amount</span><span className="font-medium">{formatCurrency(emi.emiAmount)}</span></div>
                  <div className="flex justify-between text-sm"><span>Loan Outstanding</span><span>{formatCurrency(emi.remainingBalance)}</span></div>
                  <div className="flex justify-between text-sm"><span>Progress</span><span>{emi.paidInstallments}/{emi.totalInstallments}</span></div>
                  <div className="flex justify-between text-sm"><span>Next Due</span><span>{formatDate(emi.nextDueDate)}</span></div>
                  {isOwnEmi && emi.isActive && (
                    <Button size="sm" className="w-full mt-2" onClick={async () => { await api.payEMI(emi._id); fetchData(); }}>
                      Mark as Paid
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
  );
}
