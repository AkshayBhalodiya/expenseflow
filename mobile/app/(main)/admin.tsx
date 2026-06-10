import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/ui/Screen';
import { StackHeader } from '../../src/components/layout/StackHeader';
import { Card } from '../../src/components/ui/Card';
import { Loading } from '../../src/components/ui/Loading';
import { api, AdminUser, AdminExpense } from '../../src/lib/api';
import { formatCurrency, formatDate } from '../../src/lib/utils';
import { useTheme } from '../../src/hooks/useTheme';
import { spacing } from '../../src/lib/theme';

export default function AdminScreen() {
  const { colors } = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [expenses, setExpenses] = useState<AdminExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'expenses'>('users');

  const load = useCallback(async () => {
    try {
      const [usersRes, expRes] = await Promise.all([api.getAllUsers(), api.getAllExpensesAdmin()]);
      setUsers(usersRes.data);
      setExpenses(expRes.data);
    } catch {
      setUsers([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen onRefresh={load} refreshing={loading} tabBar={false}>
      <StackHeader title="Admin Panel" subtitle="System overview" />

      <View style={[styles.tabs, { backgroundColor: colors.surfaceSecondary }]}>
        {(['users', 'expenses'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && { backgroundColor: colors.surface }]}
          >
            <Text style={{ color: tab === t ? colors.primary : colors.textSecondary, fontWeight: tab === t ? '700' : '500' }}>
              {t === 'users' ? `Users (${users.length})` : `Expenses (${expenses.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? <Loading full={false} /> : tab === 'users' ? (
        users.map((u) => (
          <Card key={u._id} style={{ marginBottom: spacing.sm }}>
            <Text style={[styles.name, { color: colors.text }]}>{u.name}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{u.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: u.role === 'admin' ? colors.primary + '20' : colors.surfaceSecondary }]}>
              <Text style={{ color: u.role === 'admin' ? colors.primary : colors.textSecondary, fontSize: 12, fontWeight: '600' }}>{u.role}</Text>
            </View>
          </Card>
        ))
      ) : (
        expenses.slice(0, 50).map((e) => (
          <Card key={e._id} style={{ marginBottom: spacing.sm }}>
            <View style={styles.expRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{e.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  {e.userId?.name || 'Unknown'} · {formatDate(e.date)}
                </Text>
              </View>
              <Text style={{ color: colors.danger, fontWeight: '700' }}>{formatCurrency(e.amount)}</Text>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  name: { fontSize: 16, fontWeight: '600' },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 6 },
  expRow: { flexDirection: 'row', alignItems: 'center' },
});
