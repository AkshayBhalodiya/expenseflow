import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../src/components/ui/Screen';
import { StackHeader } from '../../src/components/layout/StackHeader';
import { ViewToggle } from '../../src/components/layout/ViewToggle';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { FAB } from '../../src/components/ui/FAB';
import { Card } from '../../src/components/ui/Card';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Loading } from '../../src/components/ui/Loading';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { api, EMI, EMIDashboard, HouseholdEMI } from '../../src/lib/api';
import { formatCurrency, formatDate } from '../../src/lib/utils';
import { useViewStore } from '../../src/store/viewStore';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { radius, spacing } from '../../src/lib/theme';

export default function EMIScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { viewMode } = useViewStore();
  const [emis, setEmis] = useState<(EMI | HouseholdEMI)[]>([]);
  const [dashboard, setDashboard] = useState<EMIDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    loanName: '', totalAmount: '', emiAmount: '', totalInstallments: '', interestRate: '0',
  });

  const load = useCallback(async () => {
    try {
      if (viewMode === 'household') {
        const res = await api.getHouseholdEMIs();
        setEmis(res.data);
        setDashboard(null);
      } else {
        const [emiRes, dashRes] = await Promise.all([api.getEMIs(), api.getEMIDashboard()]);
        setEmis(emiRes.data);
        setDashboard(dashRes.data);
      }
    } catch {
      setEmis([]);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const handleCreate = async () => {
    try {
      await api.createEMI({
        loanName: form.loanName,
        totalAmount: parseFloat(form.totalAmount),
        emiAmount: parseFloat(form.emiAmount),
        totalInstallments: parseInt(form.totalInstallments),
        interestRate: parseFloat(form.interestRate),
        startDate: new Date().toISOString(),
      });
      setShowForm(false);
      load();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create EMI');
    }
  };

  const handlePay = (id: string) => {
    Alert.alert('Pay EMI', 'Record this installment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay', onPress: async () => { await api.payEMI(id); load(); } },
    ]);
  };

  const currency = user?.currency || 'INR';

  return (
    <View style={styles.flex}>
      <Screen onRefresh={load} refreshing={loading} tabBar={false} fab={viewMode === 'personal'}>
        <StackHeader title="EMI / Loans" subtitle="Track loan payments" />
        <ViewToggle />

        {dashboard && (
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={{ color: colors.text, fontWeight: '700', marginBottom: spacing.sm }}>Loan Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={{ color: colors.textSecondary }}>Outstanding {formatCurrency(dashboard.remainingBalance, currency)}</Text>
              <Text style={{ color: colors.textSecondary }}>{dashboard.activeLoans} active</Text>
            </View>
            {dashboard.upcomingEmi && (
              <View style={[styles.upcoming, { backgroundColor: colors.warningBg }]}>
                <Text style={{ color: colors.warning, fontWeight: '600' }}>Next: {dashboard.upcomingEmi.loanName}</Text>
                <Text style={{ color: colors.text, marginTop: 2 }}>{formatCurrency(dashboard.upcomingEmi.amount, currency)} · {formatDate(dashboard.upcomingEmi.dueDate)}</Text>
              </View>
            )}
          </Card>
        )}

        {loading ? <Loading full={false} /> : emis.length === 0 ? (
          <EmptyState icon="card-outline" title="No loans" message="Add a loan to track EMI payments" />
        ) : (
          emis.map((emi) => {
            const progress = emi.totalInstallments > 0 ? (emi.paidInstallments / emi.totalInstallments) * 100 : 0;
            return (
              <View key={emi._id} style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.emiHeader}>
                  <Text style={[styles.emiName, { color: colors.text }]}>{emi.loanName}</Text>
                  {emi.isActive && viewMode === 'personal' && (
                    <Pressable onPress={() => handlePay(emi._id)}>
                      <Text style={{ color: colors.primary, fontWeight: '700' }}>Pay EMI</Text>
                    </Pressable>
                  )}
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: spacing.md }}>
                  {formatCurrency(emi.emiAmount, currency)}/mo · Due {formatDate(emi.nextDueDate)}
                </Text>
                <ProgressBar percent={progress} showLabel />
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: spacing.sm }}>
                  {emi.paidInstallments}/{emi.totalInstallments} paid · {formatCurrency(emi.remainingBalance, currency)} left
                </Text>
              </View>
            );
          })
        )}
      </Screen>

      {viewMode === 'personal' && <FAB onPress={() => setShowForm(true)} variant="stack" />}

      <BottomSheet visible={showForm} onClose={() => setShowForm(false)} title="Add Loan" subtitle="Track EMI payments">
        <Input label="Loan Name" value={form.loanName} onChangeText={(v) => setForm({ ...form, loanName: v })} />
        <Input label="Total Amount" value={form.totalAmount} onChangeText={(v) => setForm({ ...form, totalAmount: v })} keyboardType="numeric" />
        <Input label="EMI Amount" value={form.emiAmount} onChangeText={(v) => setForm({ ...form, emiAmount: v })} keyboardType="numeric" />
        <Input label="Total Installments" value={form.totalInstallments} onChangeText={(v) => setForm({ ...form, totalInstallments: v })} keyboardType="numeric" />
        <Button title="Create Loan" onPress={handleCreate} fullWidth size="lg" />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  upcoming: { padding: spacing.md, borderRadius: radius.md, marginTop: spacing.md },
  item: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  emiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emiName: { fontSize: 17, fontWeight: '700' },
});
