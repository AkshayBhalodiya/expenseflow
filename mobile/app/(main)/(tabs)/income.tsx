import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../src/components/ui/Screen';
import { PageHeader } from '../../../src/components/layout/PageHeader';
import { ViewToggle } from '../../../src/components/layout/ViewToggle';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { BottomSheet } from '../../../src/components/ui/BottomSheet';
import { FAB } from '../../../src/components/ui/FAB';
import { ListItem } from '../../../src/components/ui/ListItem';
import { Picker } from '../../../src/components/ui/Picker';
import { Loading } from '../../../src/components/ui/Loading';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { api, Income, HouseholdIncome } from '../../../src/lib/api';
import { INCOME_SOURCES } from '../../../src/lib/constants';
import { formatCurrency, formatDate, todayISO, capitalize } from '../../../src/lib/utils';
import { useViewStore } from '../../../src/store/viewStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useTheme } from '../../../src/hooks/useTheme';
import { radius, spacing } from '../../../src/lib/theme';
import { Ionicons } from '@expo/vector-icons';

export default function IncomeScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { viewMode } = useViewStore();
  const [income, setIncome] = useState<(Income | HouseholdIncome)[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ source: 'salary', amount: '', date: todayISO(), notes: '' });

  const load = useCallback(async () => {
    try {
      const req = viewMode === 'household' ? api.getHouseholdIncome() : api.getIncome();
      const res = await req;
      setIncome(res.data);
    } catch {
      setIncome([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const handleSubmit = async () => {
    if (!form.amount) {
      Alert.alert('Required', 'Please enter amount');
      return;
    }
    try {
      await api.createIncome({ ...form, amount: parseFloat(form.amount) });
      setShowForm(false);
      setForm({ source: 'salary', amount: '', date: todayISO(), notes: '' });
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add income');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Income', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.deleteIncome(id); load(); } },
    ]);
  };

  const currency = user?.currency || 'INR';
  const total = income.reduce((s, i) => s + i.amount, 0);

  return (
    <View style={styles.flex}>
      <Screen onRefresh={load} refreshing={loading} fab={viewMode === 'personal'}>
        <PageHeader
          title="Income"
          subtitle={viewMode === 'household' ? 'All home members' : `${income.length} entries`}
        />
        <ViewToggle />

        {income.length > 0 && (
          <View style={[styles.summary, { backgroundColor: colors.successBg }]}>
            <Ionicons name="trending-up" size={20} color={colors.success} />
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Total income</Text>
              <Text style={[styles.summaryAmount, { color: colors.success }]}>{formatCurrency(total, currency)}</Text>
            </View>
          </View>
        )}

        {loading ? <Loading full={false} /> : income.length === 0 ? (
          <EmptyState icon="trending-up-outline" title="No income yet" message="Tap + to record your earnings" />
        ) : (
          income.map((item) => (
            <ListItem
              key={item._id}
              title={capitalize(item.source)}
              subtitle={`${formatDate(item.date)}${'userId' in item && item.userId?.name ? ` · ${item.userId.name}` : ''}`}
              amount={formatCurrency(item.amount, currency)}
              amountColor={colors.success}
              icon="cash"
              iconColor={colors.success}
              iconBg={colors.successBg}
              onDelete={viewMode === 'personal' ? () => handleDelete(item._id) : undefined}
            />
          ))
        )}
      </Screen>

      {viewMode === 'personal' && <FAB onPress={() => setShowForm(true)} />}

      <BottomSheet visible={showForm} onClose={() => setShowForm(false)} title="Add Income" subtitle="Record new earnings">
        <Picker label="Source" value={form.source} options={INCOME_SOURCES.map((s) => ({ value: s, label: capitalize(s) }))} onChange={(v) => setForm({ ...form, source: v })} />
        <Input label="Amount" value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} keyboardType="numeric" placeholder="0" />
        <Input label="Date" value={form.date} onChangeText={(v) => setForm({ ...form, date: v })} placeholder="YYYY-MM-DD" />
        <Input label="Notes (optional)" value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} />
        <Button title="Save Income" onPress={handleSubmit} fullWidth size="lg" />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
