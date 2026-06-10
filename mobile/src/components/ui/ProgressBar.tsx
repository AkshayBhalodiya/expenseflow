import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { radius } from '../../lib/theme';

interface ProgressBarProps {
  percent: number;
  color?: string;
  showLabel?: boolean;
}

export function ProgressBar({ percent, color, showLabel }: ProgressBarProps) {
  const { colors } = useTheme();
  const clamped = Math.min(100, Math.max(0, percent));
  const barColor = color || (clamped >= 90 ? colors.danger : clamped >= 70 ? colors.warning : colors.primary);

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: barColor }]} />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{clamped.toFixed(0)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 8, borderRadius: radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.full },
  label: { fontSize: 12, fontWeight: '600', minWidth: 36 },
});
