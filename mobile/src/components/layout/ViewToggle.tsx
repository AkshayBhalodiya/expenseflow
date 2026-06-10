import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useViewStore } from '../../store/viewStore';
import { useHasHousehold } from '../../store/householdStore';
import { radius, spacing } from '../../lib/theme';

export function ViewToggle() {
  const { colors } = useTheme();
  const { viewMode, setViewMode } = useViewStore();
  const hasHousehold = useHasHousehold();

  if (!hasHousehold) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {(['personal', 'household'] as const).map((mode) => (
        <Pressable
          key={mode}
          onPress={() => setViewMode(mode)}
          style={[
            styles.tab,
            viewMode === mode && { backgroundColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.text,
              { color: viewMode === mode ? '#fff' : colors.textSecondary },
              viewMode === mode && styles.active,
            ]}
          >
            {mode === 'personal' ? 'Personal' : 'Home'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
    borderWidth: 1,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  text: { fontSize: 14, fontWeight: '500' },
  active: { fontWeight: '700' },
});
