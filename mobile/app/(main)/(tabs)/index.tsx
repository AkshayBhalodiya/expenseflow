import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Screen } from '../../../src/components/ui/Screen';
import { PageHeader } from '../../../src/components/layout/PageHeader';
import { ViewToggle } from '../../../src/components/layout/ViewToggle';
import { StatCard } from '../../../src/components/ui/StatCard';
import { Loading } from '../../../src/components/ui/Loading';
import { Card } from '../../../src/components/ui/Card';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { Button } from '../../../src/components/ui/Button';
import { DashboardCharts } from '../../../src/components/dashboard/Charts';
import { api, DashboardData } from '../../../src/lib/api';
import { formatCurrency } from '../../../src/lib/utils';
import { useViewStore } from '../../../src/store/viewStore';
import { useHasHousehold } from '../../../src/store/householdStore';
import { useAuthStore } from '../../../src/store/authStore';
import { useTheme } from '../../../src/hooks/useTheme';
import { layout, radius, spacing, typography } from '../../../src/lib/theme';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { viewMode } = useViewStore();
  const hasHousehold = useHasHousehold();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.getDashboard(viewMode);
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [viewMode]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const currency = user?.currency || 'INR';
  const kpis = data?.kpis;
  const isHousehold = viewMode === 'household' && data?.scope === 'household';

  if (loading) return <Loading />;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <PageHeader
        title={isHousehold ? data?.household?.name || 'Home' : `Hi, ${user?.name?.split(' ')[0] || 'there'} 👋`}
        subtitle={
          isHousehold
            ? `Combined finances · ${data?.members?.length || 0} members`
            : 'Your financial overview'
        }
      />

      <ViewToggle />

      {viewMode === 'household' && !hasHousehold && (
        <Card style={styles.setupCard}>
          <Text style={[styles.setupText, { color: colors.textSecondary }]}>
            Create or join a home to see combined finances
          </Text>
          <Button title="Setup Home" onPress={() => router.push('/(main)/household')} fullWidth />
        </Card>
      )}

      {data && kpis && (
        <>
          <LinearGradient colors={[...colors.gradient]} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.heroLabel}>Available Balance</Text>
            <Text style={styles.heroValue}>{formatCurrency(kpis.availableBalance, currency)}</Text>
            <View style={styles.heroRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Income</Text>
                <Text style={styles.heroStatValue}>{formatCurrency(kpis.totalIncome, currency)}</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Expenses</Text>
                <Text style={styles.heroStatValue}>{formatCurrency(kpis.totalExpenses, currency)}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.statsGrid}>
            <StatCard title="Savings" value={formatCurrency(kpis.totalSavings, currency)} icon="wallet" color={colors.primary} />
            <StatCard title="EMI / mo" value={formatCurrency(kpis.monthlyEmi, currency)} icon="card" color={colors.warning} />
          </View>

          <Card style={styles.budgetCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Budget Usage</Text>
            <ProgressBar percent={kpis.budgetUsage} showLabel />
            <View style={styles.row}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                Savings {kpis.savingsRate?.toFixed(1)}%
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                Expense ratio {kpis.expenseRatio?.toFixed(1)}%
              </Text>
            </View>
          </Card>

          {data.charts && (
            <View style={styles.charts}>
              <DashboardCharts
                monthlyTrend={data.charts.monthlyTrend}
                categoryWise={data.charts.categoryWise}
                weeklyTrend={data.charts.weeklyTrend}
                incomeVsExpense={data.charts.incomeVsExpense}
              />
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  setupCard: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  setupText: { textAlign: 'center', ...typography.body },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '500' },
  heroValue: { color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -1, marginTop: 4, marginBottom: spacing.lg },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroStat: { flex: 1 },
  heroDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: spacing.md },
  heroStatLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  heroStatValue: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 2 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  budgetCard: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  charts: { marginTop: spacing.sm },
});
