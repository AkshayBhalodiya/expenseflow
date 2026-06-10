import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { Card } from '../ui/Card';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../lib/theme';
import { formatCurrency } from '../../lib/utils';

const screenWidth = Dimensions.get('window').width - 64;

interface ChartsProps {
  monthlyTrend: { month: string; amount: number }[];
  categoryWise: { category: string; amount: number; percentage: number }[];
  weeklyTrend: { day: string; amount: number }[];
  incomeVsExpense: { income: number; expense: number };
}

export function DashboardCharts({ monthlyTrend, categoryWise, weeklyTrend, incomeVsExpense }: ChartsProps) {
  const { colors, isDark } = useTheme();

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => colors.textSecondary,
    propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
    propsForBackgroundLines: { stroke: colors.border },
  };

  const pieColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#f43f5e', '#eab308'];

  return (
    <View style={styles.wrap}>
      {monthlyTrend.length > 0 && (
        <Card>
          <Text style={[styles.title, { color: colors.text }]}>Monthly Expenses</Text>
          <LineChart
            data={{
              labels: monthlyTrend.slice(-6).map((m) => m.month.slice(0, 3)),
              datasets: [{ data: monthlyTrend.slice(-6).map((m) => m.amount || 0) }],
            }}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            yAxisLabel="₹"
            yAxisSuffix=""
          />
        </Card>
      )}

      {categoryWise.length > 0 && (
        <Card>
          <Text style={[styles.title, { color: colors.text }]}>By Category</Text>
          <PieChart
            data={categoryWise.slice(0, 6).map((c, i) => ({
              name: c.category.slice(0, 8),
              population: c.amount,
              color: pieColors[i % pieColors.length],
              legendFontColor: colors.textSecondary,
              legendFontSize: 12,
            }))}
            width={screenWidth}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="0"
          />
        </Card>
      )}

      {weeklyTrend.length > 0 && (
        <Card>
          <Text style={[styles.title, { color: colors.text }]}>This Week</Text>
          <BarChart
            data={{
              labels: weeklyTrend.map((w) => w.day.slice(0, 3)),
              datasets: [{ data: weeklyTrend.map((w) => w.amount || 0) }],
            }}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel="₹"
            yAxisSuffix=""
            showValuesOnTopOfBars
          />
        </Card>
      )}

      <Card>
        <Text style={[styles.title, { color: colors.text }]}>Income vs Expense</Text>
        <View style={styles.compare}>
          <View style={[styles.compareItem, { backgroundColor: colors.successBg }]}>
            <Text style={[styles.compareLabel, { color: colors.success }]}>Income</Text>
            <Text style={[styles.compareValue, { color: colors.text }]}>
              {formatCurrency(incomeVsExpense.income)}
            </Text>
          </View>
          <View style={[styles.compareItem, { backgroundColor: colors.dangerBg }]}>
            <Text style={[styles.compareLabel, { color: colors.danger }]}>Expense</Text>
            <Text style={[styles.compareValue, { color: colors.text }]}>
              {formatCurrency(incomeVsExpense.expense)}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  title: { fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  chart: { borderRadius: 12, marginLeft: -8 },
  compare: { flexDirection: 'row', gap: spacing.sm },
  compareItem: { flex: 1, padding: spacing.md, borderRadius: 12, alignItems: 'center' },
  compareLabel: { fontSize: 13, fontWeight: '600' },
  compareValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
});
