import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { spacing, typography } from '../../lib/theme';

interface StackHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function StackHeader({ title, subtitle, right }: StackHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  title: { ...typography.h1, fontSize: 22 },
  subtitle: { ...typography.caption, marginTop: 2 },
  right: { flexShrink: 0 },
  placeholder: { width: 36 },
});
