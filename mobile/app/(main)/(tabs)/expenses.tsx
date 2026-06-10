import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../src/components/ui/Screen';
import { PageHeader } from '../../../src/components/layout/PageHeader';
import { ViewToggle } from '../../../src/components/layout/ViewToggle';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { BottomSheet } from '../../../src/components/ui/BottomSheet';
import { FAB } from '../../../src/components/ui/FAB';
import { SearchBar } from '../../../src/components/ui/SearchBar';
import { ListItem } from '../../../src/components/ui/ListItem';
import { Picker } from '../../../src/components/ui/Picker';
import { Loading } from '../../../src/components/ui/Loading';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { api, Expense, CreditCardType, HouseholdExpense } from '../../../src/lib/api';
import { CATEGORIES, PAYMENT_METHODS } from '../../../src/lib/constants';
import { formatCurrency, formatDate, todayISO } from '../../../src/lib/utils';
import { useViewStore } from '../../../src/store/viewStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useTheme } from '../../../src/hooks/useTheme';
import { radius, spacing } from '../../../src/lib/theme';

const emptyForm = {
  title: '', amount: '', category: 'Food', date: todayISO(),
  notes: '', paymentMethod: 'cash', creditCardId: '',
};

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { viewMode } = useViewStore();
  const [expenses, setExpenses] = useState<(Expense | HouseholdExpense)[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      const req = viewMode === 'household'
        ? api.getHouseholdExpenses()
        : api.getExpenses(search ? { search } : undefined);
      const res = await req;
      setExpenses(res.data);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode, search]);

  useEffect(() => { setLoading(true); load(); }, [load]);
  useEffect(() => {
    api.getCreditCards().then((r) => setCreditCards(r.data.filter((c) => c.isActive))).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.amount) {
      Alert.alert('Required', 'Please enter title and amount');
      return;
    }
    try {
      await api.createExpense({
        ...form,
        amount: parseFloat(form.amount),
        creditCardId: form.paymentMethod === 'card' ? form.creditCardId : undefined,
      });
      setShowForm(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add expense');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.deleteExpense(id); load(); } },
    ]);
  };

  const handleScan = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    try {
      const res = await api.scanReceipt(asset.uri, asset.fileName || 'receipt.jpg', asset.mimeType || 'image/jpeg', true);
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
      load();
    } catch (err) {
      Alert.alert('Scan failed', err instanceof Error ? err.message : 'Could not scan receipt');
    }
  };

  const currency = user?.currency || 'INR';
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <View style={styles.flex}>
      <Screen onRefresh={load} refreshing={loading} fab={viewMode === 'personal'}>
        <PageHeader
          title="Expenses"
          subtitle={viewMode === 'household' ? 'All home members' : `${expenses.length} transactions`}
          actions={
            viewMode === 'personal' ? (
              <Pressable onPress={handleScan} style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="scan-outline" size={22} color={colors.primary} />
              </Pressable>
            ) : undefined
          }
        />
        <ViewToggle />

        {viewMode === 'personal' && (
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search expenses..." />
        )}

        {expenses.length > 0 && (
          <View style={[styles.summary, { backgroundColor: colors.dangerBg }]}>
            <Ionicons name="wallet-outline" size={20} color={colors.danger} />
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Total spent</Text>
              <Text style={[styles.summaryAmount, { color: colors.danger }]}>{formatCurrency(total, currency)}</Text>
            </View>
          </View>
        )}

        {loading ? <Loading full={false} /> : expenses.length === 0 ? (
          <EmptyState icon="receipt-outline" title="No expenses yet" message="Tap + to add your first expense" />
        ) : (
          expenses.map((exp) => (
            <ListItem
              key={exp._id}
              title={exp.title}
              subtitle={`${exp.category} · ${formatDate(exp.date)}${'userId' in exp && exp.userId?.name ? ` · ${exp.userId.name}` : ''}`}
              amount={formatCurrency(exp.amount, currency)}
              amountColor={colors.danger}
              icon="pricetag"
              iconColor={colors.primary}
              onDelete={() => handleDelete(exp._id)}
            />
          ))
        )}
      </Screen>

      {viewMode === 'personal' && <FAB onPress={() => setShowForm(true)} />}

      <BottomSheet visible={showForm} onClose={() => setShowForm(false)} title="Add Expense" subtitle="Track a new spending">
        <Input label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} placeholder="e.g. Groceries" />
        <Input label="Amount" value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} keyboardType="numeric" placeholder="0" />
        <Picker label="Category" value={form.category} options={CATEGORIES.map((c) => ({ value: c, label: c }))} onChange={(v) => setForm({ ...form, category: v })} />
        <Input label="Date" value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM-DD" />
        <Picker label="Payment Method" value={form.paymentMethod} options={PAYMENT_METHODS} onChange={(v) => setForm({ ...form, paymentMethod: v })} />
        {form.paymentMethod === 'card' && creditCards.length > 0 && (
          <Picker label="Credit Card" value={form.creditCardId || creditCards[0]._id} options={creditCards.map((c) => ({ value: c._id, label: `${c.cardName} ••${c.lastFourDigits}` }))} onChange={(v) => setForm({ ...form, creditCardId: v })} />
        )}
        <Input label="Notes (optional)" value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} />
        <Button title="Save Expense" onPress={handleSubmit} fullWidth size="lg" />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  summaryText: { flex: 1 },
  summaryLabel: { fontSize: 12, fontWeight: '500', opacity: 0.8 },
  summaryAmount: { fontSize: 20, fontWeight: '800', marginTop: 2 },
});
