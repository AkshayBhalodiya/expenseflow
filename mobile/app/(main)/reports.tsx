import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Screen } from '../../src/components/ui/Screen';
import { StackHeader } from '../../src/components/layout/StackHeader';
import { Card } from '../../src/components/ui/Card';
import { Picker } from '../../src/components/ui/Picker';
import { Button } from '../../src/components/ui/Button';
import { Loading } from '../../src/components/ui/Loading';
import { api, ReportData } from '../../src/lib/api';
import { formatCurrency } from '../../src/lib/utils';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { spacing } from '../../src/lib/theme';

const PERIODS = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'yearly', label: 'This Year' },
];

export default function ReportsScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [period, setPeriod] = useState('monthly');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getReport({ period });
      setReport(res.data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    setExporting(true);
    try {
      const blob = await api.exportReport({ period, format });
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const ext = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'xlsx';
        const fileUri = FileSystem.documentDirectory + `report.${ext}`;
        await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Saved', `Report saved to ${fileUri}`);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      Alert.alert('Export failed', err instanceof Error ? err.message : 'Could not export');
    } finally {
      setExporting(false);
    }
  };

  const currency = user?.currency || 'INR';
  const summary = report?.summary;

  return (
    <Screen tabBar={false}>
      <StackHeader title="Reports" subtitle="Financial summaries & exports" />

      <Picker label="Period" value={period} options={PERIODS} onChange={setPeriod} />

      {loading ? <Loading full={false} /> : summary ? (
        <>
          <Card style={{ marginTop: spacing.md }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Income</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>{formatCurrency(summary.totalIncome, currency)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Expenses</Text>
                <Text style={[styles.summaryValue, { color: colors.danger }]}>{formatCurrency(summary.totalExpenses, currency)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>EMI</Text>
                <Text style={[styles.summaryValue, { color: colors.warning }]}>{formatCurrency(summary.totalEmi, currency)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Net Savings</Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>{formatCurrency(summary.netSavings, currency)}</Text>
              </View>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: spacing.sm }}>
              {summary.expenseCount} expenses · {summary.incomeCount} income entries
            </Text>
          </Card>

          <Text style={[styles.exportTitle, { color: colors.text }]}>Export Report</Text>
          <View style={styles.exportRow}>
            <Button title="PDF" variant="outline" onPress={() => handleExport('pdf')} loading={exporting} style={styles.exportBtn} />
            <Button title="CSV" variant="outline" onPress={() => handleExport('csv')} loading={exporting} style={styles.exportBtn} />
            <Button title="Excel" variant="outline" onPress={() => handleExport('excel')} loading={exporting} style={styles.exportBtn} />
          </View>
        </>
      ) : (
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 32 }}>No report data</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  summaryItem: { width: '45%' },
  summaryValue: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  exportTitle: { fontSize: 16, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
  exportRow: { flexDirection: 'row', gap: spacing.sm },
  exportBtn: { flex: 1, paddingVertical: 10 },
});
