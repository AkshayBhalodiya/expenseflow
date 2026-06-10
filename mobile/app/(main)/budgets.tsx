import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { StackHeader } from '../../src/components/layout/StackHeader';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { FAB } from '../../src/components/ui/FAB';
import { Picker } from '../../src/components/ui/Picker';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Loading } from '../../src/components/ui/Loading';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { api, Budget } from '../../src/lib/api';
import { CATEGORIES } from '../../src/lib/constants';
import { formatCurrency } from '../../src/lib/utils';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { radius, spacing } from '../../src/lib/theme';

export default function BudgetsScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'Food', amount: '' });

  const load = useCallback(async () => {
    try {
      const res = await api.getBudgets();
      setBudgets(res.data);
    } catch {
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const handleCreate = async () => {
    try {
      const now = new Date();
      await api.createBudget({
        category: form.category,
        amount: parseFloat(form.amount),
        month: now.toLocaleString('en', { month: 'long' }),
        year: now.getFullYear(),
      });
      setShowForm(false);
      setForm({ category: 'Food', amount: '' });
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create budget');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Budget', 'Remove this budget?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.deleteBudget(id); load(); } },
    ]);
  };

  const currency = user?.currency || 'INR';

  return (
    <View style={styles.flex}>
      <Screen onRefresh={load} refreshing={loading} tabBar={false} fab>
        <StackHeader title="Budgets" subtitle="Monthly category limits" />
        {loading ? <Loading full={false} /> : budgets.length === 0 ? (
          <EmptyState icon="pie-chart-outline" title="No budgets" message="Set monthly limits to control spending" />
        ) : (
          budgets.map((b) => (
            <View key={b._id} style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.itemHeader}>
                <View style={[styles.icon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="pie-chart" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.category, { color: colors.text }]}>{b.category}</Text>
                <Button title="Delete" variant="ghost" size="sm" onPress={() => handleDelete(b._id)} />
              </View>
              <ProgressBar percent={b.usagePercent} showLabel />
              <View style={styles.footer}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Spent {formatCurrency(b.spent, currency)}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Left {formatCurrency(b.remaining, currency)}</Text>
              </View>
            </View>
          ))
        )}
      </Screen>
      <FAB onPress={() => setShowForm(true)} variant="stack" />
      <BottomSheet visible={showForm} onClose={() => setShowForm(false)} title="New Budget" subtitle="Set monthly limit">
        <Picker label="Category" value={form.category} options={CATEGORIES.map((c) => ({ value: c, label: c }))} onChange={(v) => setForm({ ...form, category: v })} />
        <Input label="Monthly Amount" value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} keyboardType="numeric" />
        <Button title="Create Budget" onPress={handleCreate} fullWidth size="lg" />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  item: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  icon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  category: { flex: 1, fontSize: 17, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
});
