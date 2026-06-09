'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, CreditCard, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/dashboard/stat-card';
import { MemberBreakdown } from '@/components/dashboard/member-breakdown';
import { api, CreditCardType, CreditCardDashboard, HouseholdCreditCard, MemberSummary } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useViewStore } from '@/store/viewStore';
import { useAuthStore } from '@/store/authStore';
import { useHasHousehold, useHouseholdStore } from '@/store/householdStore';

const CARD_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function CreditCardsPage() {
  const { viewMode } = useViewStore();
  const { user } = useAuthStore();
  const currentUserId = user?._id || user?.id;
  const [cards, setCards] = useState<(CreditCardType | HouseholdCreditCard)[]>([]);
  const [dashboard, setDashboard] = useState<CreditCardDashboard | null>(null);
  const hasHousehold = useHasHousehold();
  const fetchMembers = useHouseholdStore((s) => s.fetchMembers);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [payingCard, setPayingCard] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [form, setForm] = useState({
    cardName: '', bankName: '', lastFourDigits: '', creditLimit: '',
    billingCycleDay: '1', paymentDueDay: '15', color: CARD_COLORS[0],
  });

  const isHousehold = viewMode === 'household' && hasHousehold;

  const householdStats = useMemo(() => {
    const totalLimit = cards.reduce((s, c) => s + c.creditLimit, 0);
    const totalUsed = cards.reduce((s, c) => s + c.usedAmount, 0);
    return {
      totalLimit,
      totalUsed,
      totalAvailable: totalLimit - totalUsed,
      utilization: totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0,
    };
  }, [cards]);

  const fetchData = () => {
    if (viewMode === 'household') {
      Promise.all([api.getHouseholdCreditCards(), fetchMembers()])
        .then(([cardsRes, memberList]) => {
          setCards(cardsRes.data);
          setMembers(memberList);
          setDashboard(null);
        })
        .catch(console.error);
    } else {
      Promise.all([api.getCreditCards(), api.getCreditCardDashboard()])
        .then(([cardsRes, dashRes]) => {
          setCards(cardsRes.data);
          setDashboard(dashRes.data);
        })
        .catch(console.error);
    }
  };

  useEffect(() => { fetchData(); }, [viewMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createCreditCard({
      cardName: form.cardName,
      bankName: form.bankName,
      lastFourDigits: form.lastFourDigits || '0000',
      creditLimit: parseFloat(form.creditLimit),
      billingCycleDay: parseInt(form.billingCycleDay, 10),
      paymentDueDay: parseInt(form.paymentDueDay, 10),
      color: form.color,
    });
    setShowForm(false);
    setForm({ cardName: '', bankName: '', lastFourDigits: '', creditLimit: '', billingCycleDay: '1', paymentDueDay: '15', color: CARD_COLORS[0] });
    fetchData();
  };

  const handlePay = async (cardId: string) => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    await api.payCreditCard(cardId, { amount, paymentDate: new Date() });
    setPayingCard(null);
    setPayAmount('');
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this credit card?')) return;
    try {
      await api.deleteCreditCard(id);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Cannot delete card');
    }
  };

  const stats = isHousehold ? householdStats : dashboard;

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Credit Cards</h1>
            <p className="text-muted-foreground">
              {isHousehold ? 'All home members cards combined' : 'Track usage, limits, and bill payments'}
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" /> Add Card
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Limit" value={stats?.totalLimit || 0} icon={CreditCard} subtitle={isHousehold ? 'Home combined' : 'All cards combined'} />
          <StatCard title="Total Used" value={stats?.totalUsed || 0} icon={IndianRupee} subtitle="Outstanding on cards" />
          <StatCard title="Available Credit" value={stats?.totalAvailable || 0} icon={CreditCard} subtitle="Limit − Used" />
          <StatCard title="Utilization" value={stats?.utilization || 0} icon={CreditCard} format="percent" subtitle="Overall usage %" />
        </div>

        {isHousehold && members.length > 0 && (
          <MemberBreakdown members={members} combinedIncome={members.reduce((s, m) => s + m.totalIncome, 0)} />
        )}

        {showForm && (
          <Card>
            <CardHeader><CardTitle>Add Credit Card</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Card Name</Label><Input value={form.cardName} onChange={(e) => setForm({ ...form, cardName: e.target.value })} placeholder="HDFC Regalia" required /></div>
                <div className="space-y-2"><Label>Bank Name</Label><Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} placeholder="HDFC Bank" required /></div>
                <div className="space-y-2"><Label>Last 4 Digits</Label><Input value={form.lastFourDigits} onChange={(e) => setForm({ ...form, lastFourDigits: e.target.value.slice(0, 4) })} maxLength={4} placeholder="1234" /></div>
                <div className="space-y-2"><Label>Credit Limit (₹)</Label><Input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Billing Cycle Day</Label><Input type="number" min={1} max={28} value={form.billingCycleDay} onChange={(e) => setForm({ ...form, billingCycleDay: e.target.value })} /></div>
                <div className="space-y-2"><Label>Payment Due Day</Label><Input type="number" min={1} max={28} value={form.paymentDueDay} onChange={(e) => setForm({ ...form, paymentDueDay: e.target.value })} /></div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Card Color</Label>
                  <div className="flex gap-2">
                    {CARD_COLORS.map((c) => (
                      <button key={c} type="button" className={`w-8 h-8 rounded-full border-2 ${form.color === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} onClick={() => setForm({ ...form, color: c })} />
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <Button type="submit">Save Card</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.length === 0 ? (
            <Card className="md:col-span-3">
              <CardContent className="p-8 text-center text-muted-foreground">
                <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                No credit cards added yet
              </CardContent>
            </Card>
          ) : (
            cards.map((card) => {
              const cardUserId = 'userId' in card && card.userId
                ? (typeof card.userId === 'object' ? (card.userId as { _id?: string })._id : String(card.userId))
                : undefined;
              const owner = 'ownerName' in card ? card.ownerName
                : ('userId' in card && card.userId && typeof card.userId === 'object' ? card.userId.name : undefined);
              const isOwnCard = !isHousehold || (currentUserId && cardUserId === currentUserId);
              return (
                <Card key={card._id} className="overflow-hidden">
                  <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}99)` }}>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-sm opacity-80">{card.bankName}</p>
                        <p className="font-semibold text-lg">{card.cardName}</p>
                        {owner && <p className="text-xs opacity-70 mt-1">{owner}</p>}
                      </div>
                      <CreditCard className="h-8 w-8 opacity-80" />
                    </div>
                    <p className="font-mono text-xl tracking-widest mb-4">•••• •••• •••• {card.lastFourDigits}</p>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="opacity-70">Used</p>
                        <p className="font-semibold">{formatCurrency(card.usedAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="opacity-70">Available</p>
                        <p className="font-semibold">{formatCurrency(card.availableCredit)}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Limit: {formatCurrency(card.creditLimit)}</span>
                        <span className={card.utilizationPercent >= 80 ? 'text-destructive font-medium' : ''}>
                          {card.utilizationPercent}% used
                        </span>
                      </div>
                      <Progress value={card.utilizationPercent} className="h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground">Bill due on day {card.paymentDueDay} of each month</p>

                    {isOwnCard && (
                      payingCard === card._id ? (
                        <div className="flex gap-2">
                          <Input type="number" placeholder="Payment amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} max={card.usedAmount} />
                          <Button size="sm" onClick={() => handlePay(card._id)}>Pay</Button>
                          <Button size="sm" variant="outline" onClick={() => setPayingCard(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1" disabled={card.usedAmount === 0} onClick={() => { setPayingCard(card._id); setPayAmount(String(card.usedAmount)); }}>
                            Pay Bill
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(card._id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
  );
}
