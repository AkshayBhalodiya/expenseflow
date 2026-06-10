import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { getTabBarOffset } from '../layout/CustomTabBar';
import { layout } from '../../lib/theme';

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  /** tab = above floating tab bar, stack = standalone screen */
  variant?: 'tab' | 'stack';
}

export function FAB({ onPress, icon = 'add', variant = 'tab' }: FABProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const bottom =
    variant === 'tab'
      ? getTabBarOffset(insets.bottom) + layout.fab.gapAboveTabBar
      : Math.max(insets.bottom, 16) + layout.fab.stackBottom;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        {
          bottom,
          right: layout.fab.offsetRight,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
    >
      <View style={[styles.ring, { borderColor: colors.surface }]}>
        <LinearGradient
          colors={[...colors.gradient]}
          style={styles.fab}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={26} color="#fff" />
        </LinearGradient>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 100,
  },
  ring: {
    borderRadius: layout.fab.size / 2 + 3,
    borderWidth: 3,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  fab: {
    width: layout.fab.size,
    height: layout.fab.size,
    borderRadius: layout.fab.size / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
