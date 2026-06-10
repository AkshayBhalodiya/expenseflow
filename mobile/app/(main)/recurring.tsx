import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { StackHeader } from '../../src/components/layout/StackHeader';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { FAB } from '../../src/components/ui/FAB';
import { Picker } from '../../src/components/ui/Picker';
import { Loading } from '../../src/components/ui/Loading';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { api, RecurringTransaction } from '../../src/lib/api';
import { CATEGORIES, FREQUENCIES, INCOME_SOURCES } from '../../src/lib/constants';
import { formatCurrency, formatDate, todayISO, capitalize } from '../../src/lib/utils';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { radius, spacing } from '../../src/lib/theme';

export default function RecurringScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'expense' as 'expense' | 'income', title: '', amount: '', frequency: 'monthly',
    category: 'Food', source: 'salary', paymentMethod: 'cash', startDate: todayISO(),
  });

  const load = useCallback(async () => {
    try {
      const res = await api.getRecurring();
      setItems(res.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const handleCreate = async () => {
    try {
      await api.createRecurring({ ...form, amount: parseFloat(form.amount) });
      setShowForm(false);
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create');
    }
  };

  const handleToggle = async (id: string) => {
    await api.toggleRecurring(id);
    load();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Delete this recurring transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.deleteRecurring(id); load(); } },
    ]);
  };

  const currency = user?.currency || 'INR';

  return (
    <View style={styles.flex}>
      <Screen onRefresh={load} refreshing={loading} tabBar={false} fab>
        <StackHeader title="Recurring" subtitle="Automated transactions" />
        {loading ? <Loading full={false} /> : items.length === 0 ? (
          <EmptyState icon="refresh-outline" title="No recurring items" message="Set up automatic income or expenses" />
        ) : (
          items.map((item) => (
            <View key={item._id} style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.itemRow}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'income' ? colors.successBg : colors.dangerBg }]}>
                  <Ionicons name={item.type === 'income' ? 'arrow-down' : 'arrow-up'} size={16} color={item.type === 'income' ? colors.success : colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    {capitalize(item.frequency)} · Next {formatDate(item.nextRunDate)}
                  </Text>
                </View>
                <Text style={{ color: item.type === 'income' ? colors.success : colors.danger, fontWeight: '700' }}>
                  {formatCurrency(item.amount, currency)}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <View style={styles.toggleRow}>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Active</Text>
                  <Switch value={item.isActive} onValueChange={() => handleToggle(item._id)} trackColor={{ true: colors.primary }} />
                </View>
                <Pressable onPress={() => handleDelete(item._id)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </Screen>
      <FAB onPress={() => setShowForm(true)} icon="refresh" variant="stack" />
      <BottomSheet visible={showForm} onClose={() => setShowForm(false)} title="New Recurring" subtitle="Automate a transaction">
        <Picker label="Type" value={form.type} options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]} onChange={(v) => setForm({ ...form, type: v as 'expense' | 'income' })} />
        <Input label="Title" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
        <Input label="Amount" value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })} keyboardType="numeric" />
        <Picker label="Frequency" value={form.frequency} options={FREQUENCIES} onChange={(v) => setForm({ ...form, frequency: v })} />
        {form.type === 'expense' ? (
          <Picker label="Category" value={form.category} options={CATEGORIES.map((c) => ({ value: c, label: c }))} onChange={(v) => setForm({ ...form, category: v })} />
        ) : (
          <Picker label="Source" value={form.source} options={INCOME_SOURCES.map((s) => ({ value: s, label: capitalize(s) }))} onChange={(v) => setForm({ ...form, source: v })} />
        )}
        <Button title="Create" onPress={handleCreate} fullWidth size="lg" />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  item: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  typeBadge: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600' },
  itemActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.06)' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
