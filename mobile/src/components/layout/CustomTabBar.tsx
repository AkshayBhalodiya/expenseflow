import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { layout } from '../../lib/theme';

type TabIcon = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: Record<string, { label: string; icon: TabIcon; iconFocused: TabIcon }> = {
  index: { label: 'Home', icon: 'home-outline', iconFocused: 'home' },
  expenses: { label: 'Expenses', icon: 'receipt-outline', iconFocused: 'receipt' },
  income: { label: 'Income', icon: 'trending-up-outline', iconFocused: 'trending-up' },
  cards: { label: 'Cards', icon: 'card-outline', iconFocused: 'card' },
  more: { label: 'More', icon: 'grid-outline', iconFocused: 'grid' },
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.outer,
        {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name] || {
          label: route.name,
          icon: 'ellipse-outline' as TabIcon,
          iconFocused: 'ellipse' as TabIcon,
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <View style={[styles.indicator, isFocused && { backgroundColor: colors.primary }]} />
            <Ionicons
              name={isFocused ? config.iconFocused : config.icon}
              size={isFocused ? 24 : 22}
              color={isFocused ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.label,
                { color: isFocused ? colors.primary : colors.textMuted },
                isFocused && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 2,
    gap: 2,
  },
  indicator: {
    width: 28,
    height: 3,
    borderRadius: 2,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 11,
    fontWeight: '400',
  },
  labelActive: {
    fontWeight: '700',
  },
});

/** Total height consumed by tab bar area (for content padding) */
export function getTabBarOffset(bottomInset: number) {
  return bottomInset + layout.tabBar.contentHeight + layout.tabBar.marginTop;
}
