import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { StackHeader } from '../../src/components/layout/StackHeader';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { FAB } from '../../src/components/ui/FAB';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Loading } from '../../src/components/ui/Loading';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { api, Goal } from '../../src/lib/api';
import { formatCurrency } from '../../src/lib/utils';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { radius, spacing } from '../../src/lib/theme';

export default function GoalsScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [form, setForm] = useState({ goalName: '', targetAmount: '' });

  const load = useCallback(async () => {
    try {
      const res = await api.getGoals();
      setGoals(res.data);
    } catch {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const handleCreate = async () => {
    try {
      await api.createGoal({ goalName: form.goalName, targetAmount: parseFloat(form.targetAmount) });
      setShowForm(false);
      setForm({ goalName: '', targetAmount: '' });
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create goal');
    }
  };

  const handleAddFunds = async () => {
    if (!showAddFunds) return;
    try {
      await api.addToGoal(showAddFunds, parseFloat(addAmount));
      setShowAddFunds(null);
      setAddAmount('');
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add funds');
    }
  };

  const currency = user?.currency || 'INR';
  const activeGoal = goals.find((g) => g._id === showAddFunds);

  return (
    <View style={styles.flex}>
      <Screen onRefresh={load} refreshing={loading} tabBar={false} fab>
        <StackHeader title="Savings Goals" subtitle="Track your targets" />
        {loading ? <Loading full={false} /> : goals.length === 0 ? (
          <EmptyState icon="flag-outline" title="No goals yet" message="Create a savings goal to stay motivated" />
        ) : (
          goals.map((g) => (
            <View key={g._id} style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.itemHeader}>
                <View style={[styles.icon, { backgroundColor: colors.warningBg }]}>
                  <Ionicons name="flag" size={18} color={colors.warning} />
                </View>
                <View style={styles.itemText}>
                  <Text style={[styles.goalName, { color: colors.text }]}>{g.goalName}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                    {formatCurrency(g.currentAmount, currency)} of {formatCurrency(g.targetAmount, currency)}
                  </Text>
                </View>
                <Button title="Add" size="sm" onPress={() => { setShowAddFunds(g._id); setAddAmount(''); }} />
              </View>
              <ProgressBar percent={g.progress} showLabel />
            </View>
          ))
        )}
      </Screen>
      <FAB onPress={() => setShowForm(true)} icon="flag" variant="stack" />
      <BottomSheet visible={showForm} onClose={() => setShowForm(false)} title="New Goal" subtitle="Set a savings target">
        <Input label="Goal Name" value={form.goalName} onChangeText={(v) => setForm({ ...form, goalName: v })} placeholder="Vacation Fund" />
        <Input label="Target Amount" value={form.targetAmount} onChangeText={(v) => setForm({ ...form, targetAmount: v })} keyboardType="numeric" />
        <Button title="Create Goal" onPress={handleCreate} fullWidth size="lg" />
      </BottomSheet>
      <BottomSheet
        visible={!!showAddFunds}
        onClose={() => setShowAddFunds(null)}
        title="Add Funds"
        subtitle={activeGoal?.goalName}
      >
        <Input label="Amount" value={addAmount} onChangeText={setAddAmount} keyboardType="numeric" placeholder="0" />
        <Button title="Add to Goal" onPress={handleAddFunds} fullWidth size="lg" />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  item: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  icon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1 },
  goalName: { fontSize: 16, fontWeight: '700' },
});
