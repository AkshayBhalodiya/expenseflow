import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { radius, spacing } from '../../lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  style,
  textStyle,
  icon,
  fullWidth,
}: ButtonProps) {
  const { colors } = useTheme();

  const variantStyles = {
    primary: { bg: colors.primary, text: '#fff', border: colors.primary },
    secondary: { bg: colors.surfaceSecondary, text: colors.text, border: colors.border },
    outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
    danger: { bg: colors.danger, text: '#fff', border: colors.danger },
    ghost: { bg: 'transparent', text: colors.textSecondary, border: 'transparent' },
  }[variant];

  const sizeStyles = {
    sm: { py: 8, px: 14, font: 14 },
    md: { py: 14, px: spacing.md, font: 16 },
    lg: { py: 16, px: spacing.lg, font: 17 },
  }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border,
          paddingVertical: sizeStyles.py,
          paddingHorizontal: sizeStyles.px,
          opacity: pressed ? 0.88 : disabled ? 0.5 : 1,
        },
        fullWidth && styles.full,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: variantStyles.text, fontSize: sizeStyles.font }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  full: { width: '100%' },
  text: { fontWeight: '600' },
});
