import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { radius, spacing } from '../../lib/theme';

interface ListItemProps {
  title: string;
  subtitle?: string;
  amount?: string;
  amountColor?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  onDelete?: () => void;
  onPress?: () => void;
}

export function ListItem({
  title,
  subtitle,
  amount,
  amountColor,
  icon,
  iconColor,
  iconBg,
  onDelete,
  onPress,
}: ListItemProps) {
  const { colors } = useTheme();
  const accent = iconColor || colors.primary;
  const bg = iconBg || accent + '18';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.wrap,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed && onPress ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {amount ? (
          <Text style={[styles.amount, { color: amountColor || colors.text }]}>{amount}</Text>
        ) : null}
        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={10} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={17} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13 },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 16, fontWeight: '700' },
  deleteBtn: { padding: 2 },
});
