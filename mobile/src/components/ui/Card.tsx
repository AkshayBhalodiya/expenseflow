import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { radius, spacing } from '../../lib/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'flat';
}

export function Card({ style, children, variant = 'elevated', ...props }: CardProps) {
  const { colors } = useTheme();
  const elevated = variant === 'elevated';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: elevated ? colors.border : colors.borderLight,
          shadowColor: elevated ? colors.cardShadow : 'transparent',
          borderWidth: elevated ? 1 : 0,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
});
