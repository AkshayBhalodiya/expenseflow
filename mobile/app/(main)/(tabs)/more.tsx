import { StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../src/components/ui/Screen';
import { PageHeader } from '../../../src/components/layout/PageHeader';
import { useAuthStore } from '../../../src/store/authStore';
import { useTheme } from '../../../src/hooks/useTheme';
import { radius, spacing, typography } from '../../../src/lib/theme';

const menuItems = [
  { href: '/(main)/emi', label: 'EMI / Loans', icon: 'card' as const, color: '#8b5cf6' },
  { href: '/(main)/household', label: 'Home Share', icon: 'home' as const, color: '#06b6d4' },
  { href: '/(main)/budgets', label: 'Budgets', icon: 'pie-chart' as const, color: '#10b981' },
  { href: '/(main)/goals', label: 'Goals', icon: 'flag' as const, color: '#f59e0b' },
  { href: '/(main)/recurring', label: 'Recurring', icon: 'refresh' as const, color: '#6366f1' },
  { href: '/(main)/analytics', label: 'Analytics', icon: 'bar-chart' as const, color: '#ec4899' },
  { href: '/(main)/reports', label: 'Reports', icon: 'document-text' as const, color: '#3b82f6' },
  { href: '/(main)/notifications', label: 'Notifications', icon: 'notifications' as const, color: '#f97316' },
  { href: '/(main)/settings', label: 'Settings', icon: 'settings' as const, color: '#64748b' },
];

export default function MoreScreen() {
  const { colors, toggle, isDark } = useTheme();
  const { user, logout } = useAuthStore();

  const items = user?.role === 'admin'
    ? [...menuItems, { href: '/(main)/admin', label: 'Admin', icon: 'people' as const, color: '#ef4444' }]
    : menuItems;

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <Screen>
      <PageHeader title="More" subtitle="Explore all features" />

      <View style={[styles.profile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {items.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href as never)}
            style={({ pressed }) => [
              styles.gridItem,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={[styles.gridLabel, { color: colors.text }]} numberOfLines={2}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={toggle}
          style={({ pressed }) => [
            styles.menuRow,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={colors.text} />
          </View>
          <Text style={[styles.menuText, { color: colors.text }]}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.menuRow,
            { backgroundColor: colors.dangerBg, borderColor: colors.danger + '25', opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.danger + '20' }]}>
            <Ionicons name="log-out" size={20} color={colors.danger} />
          </View>
          <Text style={[styles.menuText, { color: colors.danger }]}>Logout</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { ...typography.h3, fontSize: 17 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  gridItem: {
    width: '31%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 100,
    justifyContent: 'center',
  },
  iconWrap: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  gridLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 15 },
  actions: { gap: spacing.sm },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  menuIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600' },
});
