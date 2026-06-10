import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export function Loading({ full = true }: { full?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, full && styles.full]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  full: { flex: 1 },
});
