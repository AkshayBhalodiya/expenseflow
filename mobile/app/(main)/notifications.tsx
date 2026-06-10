import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { StackHeader } from '../../src/components/layout/StackHeader';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Loading } from '../../src/components/ui/Loading';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { api, NotificationItem } from '../../src/lib/api';
import { formatDate } from '../../src/lib/utils';
import { useTheme } from '../../src/hooks/useTheme';
import { spacing } from '../../src/lib/theme';

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  emi_due: 'card',
  budget_alert: 'warning',
  monthly_summary: 'bar-chart',
  upcoming_bill: 'calendar',
  system: 'information-circle',
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    await api.markAllRead();
    load();
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <Screen onRefresh={load} refreshing={loading} tabBar={false}>
      <StackHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        right={unread > 0 ? <Button title="Read all" variant="outline" size="sm" onPress={markAllRead} /> : undefined}
      />

      {loading ? <Loading full={false} /> : notifications.length === 0 ? (
        <EmptyState icon="notifications-outline" title="No notifications" message="You're all caught up!" />
      ) : (
        notifications.map((n) => (
          <Card key={n._id} style={[styles.item, !n.isRead && { borderColor: colors.primary, borderWidth: 1.5 }]}>
            <View style={styles.itemRow}>
              <View style={[styles.icon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={typeIcons[n.type] || 'notifications'} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }, !n.isRead && { fontWeight: '700' }]}>{n.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>{n.message}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>{formatDate(n.createdAt)}</Text>
              </View>
              {!n.isRead && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { marginBottom: spacing.sm },
  itemRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});
