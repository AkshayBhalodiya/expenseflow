import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { StackHeader } from '../../src/components/layout/StackHeader';
import { Card } from '../../src/components/ui/Card';
import { StatCard } from '../../src/components/ui/StatCard';
import { Loading } from '../../src/components/ui/Loading';
import { api, AnalyticsData } from '../../src/lib/api';
import { formatCurrency } from '../../src/lib/utils';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { spacing } from '../../src/lib/theme';

function GrowthBadge({ value, label }: { value: number; label: string }) {
  const { colors } = useTheme();
  const isPositive = value >= 0;
  return (
    <View style={[styles.badge, { backgroundColor: isPositive ? colors.successBg : colors.dangerBg }]}>
      <Ionicons name={isPositive ? 'trending-up' : 'trending-down'} size={16} color={isPositive ? colors.success : colors.danger} />
      <Text style={{ color: isPositive ? colors.success : colors.danger, fontWeight: '700' }}>{value > 0 ? '+' : ''}{value.toFixed(1)}%</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.getAnalytics();
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const currency = user?.currency || 'INR';

  return (
    <Screen onRefresh={load} refreshing={loading} tabBar={false}>
      <StackHeader title="Analytics" subtitle="Month-over-month insights" />

      {loading ? <Loading full={false} /> : data ? (
        <>
          <View style={styles.statsGrid}>
            <StatCard title="This Month Savings" value={formatCurrency(data.currentMonthSavings, currency)} icon="wallet" />
            <StatCard title="EMI Ratio" value={`${data.emiRatio?.toFixed(1)}%`} icon="card" color={colors.warning} />
          </View>

          <Card style={{ marginTop: spacing.md }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Growth Metrics</Text>
            <View style={styles.growthRow}>
              <GrowthBadge value={data.incomeGrowth} label="Income" />
              <GrowthBadge value={data.expenseGrowth} label="Expenses" />
              <GrowthBadge value={data.savingsGrowth} label="Savings" />
            </View>
          </Card>

          <Card style={{ marginTop: spacing.md }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
            {data.topSpendingCategories.map((cat, i) => (
              <View key={cat.category} style={[styles.catRow, { borderColor: colors.border }]}>
                <Text style={{ color: colors.textMuted, width: 24 }}>{i + 1}</Text>
                <Text style={{ color: colors.text, flex: 1, fontWeight: '500' }}>{cat.category}</Text>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{formatCurrency(cat.amount, currency)}</Text>
                <Text style={{ color: colors.textMuted, width: 40, textAlign: 'right' }}>{cat.percentage?.toFixed(0)}%</Text>
              </View>
            ))}
          </Card>
        </>
      ) : (
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 32 }}>No analytics data available</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  growthRow: { flexDirection: 'row', gap: spacing.sm },
  badge: { flex: 1, alignItems: 'center', padding: spacing.sm, borderRadius: 12, gap: 2 },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, gap: spacing.sm },
});
