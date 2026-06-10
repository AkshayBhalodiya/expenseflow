import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../../src/components/ui/Screen';
import { PageHeader } from '../../../src/components/layout/PageHeader';
import { ViewToggle } from '../../../src/components/layout/ViewToggle';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { BottomSheet } from '../../../src/components/ui/BottomSheet';
import { FAB } from '../../../src/components/ui/FAB';
import { Card } from '../../../src/components/ui/Card';
import { Picker } from '../../../src/components/ui/Picker';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { Loading } from '../../../src/components/ui/Loading';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { api, CreditCardType, CreditCardDashboard, HouseholdCreditCard } from '../../../src/lib/api';
import { CARD_COLORS } from '../../../src/lib/constants';
import { formatCurrency } from '../../../src/lib/utils';
import { useViewStore } from '../../../src/store/viewStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useTheme } from '../../../src/hooks/useTheme';
import { spacing, radius } from '../../../src/lib/theme';

export default function CardsScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { viewMode } = useViewStore();
  const [cards, setCards] = useState<(CreditCardType | HouseholdCreditCard)[]>([]);
  const [dashboard, setDashboard] = useState<CreditCardDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [payCardId, setPayCardId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [form, setForm] = useState({
    cardName: '', bankName: '', lastFourDigits: '', creditLimit: '',
    billingCycleDay: '1', paymentDueDay: '15', color: CARD_COLORS[0],
  });

  const load = useCallback(async () => {
    try {
      if (viewMode === 'household') {
        const res = await api.getHouseholdCreditCards();
        setCards(res.data);
        setDashboard(null);
      } else {
        const [cardsRes, dashRes] = await Promise.all([api.getCreditCards(), api.getCreditCardDashboard()]);
        setCards(cardsRes.data);
        setDashboard(dashRes.data);
      }
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const handleCreate = async () => {
    try {
      await api.createCreditCard({
        ...form,
        creditLimit: parseFloat(form.creditLimit),
        billingCycleDay: parseInt(form.billingCycleDay),
        paymentDueDay: parseInt(form.paymentDueDay),
      });
      setShowForm(false);
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add card');
    }
  };

  const handlePay = async () => {
    if (!payCardId || !payAmount) return;
    try {
      await api.payCreditCard(payCardId, { amount: parseFloat(payAmount), paymentDate: new Date().toISOString() });
      setPayCardId(null);
      setPayAmount('');
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Payment failed');
    }
  };

  const currency = user?.currency || 'INR';
  const payCard = cards.find((c) => c._id === payCardId);

  return (
    <View style={styles.flex}>
      <Screen onRefresh={load} refreshing={loading} fab={viewMode === 'personal'}>
        <PageHeader title="Credit Cards" subtitle={`${cards.length} active cards`} />
        <ViewToggle />

        {dashboard && viewMode === 'personal' && (
          <Card style={styles.dashCard}>
            <Text style={[styles.dashTitle, { color: colors.text }]}>Total Utilization</Text>
            <ProgressBar percent={dashboard.utilization} showLabel />
            <View style={styles.dashRow}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Limit {formatCurrency(dashboard.totalLimit, currency)}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Used {formatCurrency(dashboard.totalUsed, currency)}</Text>
            </View>
          </Card>
        )}

        {loading ? <Loading full={false} /> : cards.length === 0 ? (
          <EmptyState icon="card-outline" title="No credit cards" message="Tap + to add your first card" />
        ) : (
          cards.map((card) => (
            <View key={card._id} style={styles.cardWrap}>
              <LinearGradient colors={[card.color, card.color + 'CC']} style={styles.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.cardBank}>{card.bankName}</Text>
                <Text style={styles.cardName}>{card.cardName}</Text>
                <Text style={styles.cardDigits}>•••• •••• •••• {card.lastFourDigits}</Text>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardLabel}>Used</Text>
                    <Text style={styles.cardValue}>{formatCurrency(card.usedAmount, currency)}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardLabel}>Available</Text>
                    <Text style={styles.cardValue}>{formatCurrency(card.availableCredit, currency)}</Text>
                  </View>
                </View>
              </LinearGradient>
              <View style={styles.cardMeta}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{card.utilizationPercent?.toFixed(0)}% utilized</Text>
                {viewMode === 'personal' && (
                  <Pressable onPress={() => { setPayCardId(card._id); setPayAmount(''); }}>
                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Pay Bill</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}
      </Screen>

      {viewMode === 'personal' && <FAB onPress={() => setShowForm(true)} icon="card" />}

      <BottomSheet visible={showForm} onClose={() => setShowForm(false)} title="Add Credit Card" subtitle="Track card limits & usage">
        <Input label="Card Name" value={form.cardName} onChangeText={(v) => setForm({ ...form, cardName: v })} placeholder="e.g. HDFC Regalia" />
        <Input label="Bank" value={form.bankName} onChangeText={(v) => setForm({ ...form, bankName: v })} />
        <Input label="Last 4 Digits" value={form.lastFourDigits} onChangeText={(v) => setForm({ ...form, lastFourDigits: v })} keyboardType="numeric" maxLength={4} />
        <Input label="Credit Limit" value={form.creditLimit} onChangeText={(v) => setForm({ ...form, creditLimit: v })} keyboardType="numeric" />
        <Picker label="Card Color" value={form.color} options={CARD_COLORS.map((c) => ({ value: c, label: c }))} onChange={(v) => setForm({ ...form, color: v })} />
        <Button title="Save Card" onPress={handleCreate} fullWidth size="lg" />
      </BottomSheet>

      <BottomSheet
        visible={!!payCardId}
        onClose={() => setPayCardId(null)}
        title="Pay Bill"
        subtitle={payCard ? `${payCard.cardName} ••${payCard.lastFourDigits}` : undefined}
      >
        <Input label="Payment Amount" value={payAmount} onChangeText={setPayAmount} keyboardType="numeric" placeholder="0" />
        <Button title="Record Payment" onPress={handlePay} fullWidth size="lg" />
        <Button title="Cancel" variant="ghost" onPress={() => setPayCardId(null)} fullWidth />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  dashCard: { marginBottom: spacing.lg },
  dashTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  dashRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  cardWrap: { marginBottom: spacing.lg },
  cardGradient: { borderRadius: radius.xl, padding: spacing.xl },
  cardBank: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },
  cardName: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  cardDigits: { color: '#fff', fontSize: 17, letterSpacing: 2, marginTop: spacing.lg },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '500' },
  cardValue: { color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 2 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, paddingTop: spacing.sm },
});
