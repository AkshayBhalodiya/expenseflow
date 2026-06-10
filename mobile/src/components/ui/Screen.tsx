import { RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { getTabBarOffset } from '../layout/CustomTabBar';
import { layout, spacing } from '../../lib/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  tabBar?: boolean;
  /** Extra bottom padding when FAB is shown */
  fab?: boolean;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  refreshing,
  onRefresh,
  style,
  tabBar = true,
  fab = false,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  let bottomPad = spacing.lg;
  if (tabBar) {
    bottomPad = getTabBarOffset(insets.bottom);
    if (fab) bottomPad += layout.fab.contentInset;
  } else if (fab) {
    bottomPad = Math.max(insets.bottom, 16) + layout.fab.size + layout.fab.stackBottom + 16;
  } else {
    bottomPad = Math.max(insets.bottom, 16) + spacing.lg;
  }

  const contentStyle = [padded && styles.padded, { paddingBottom: bottomPad }, style];

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, { paddingBottom: bottomPad }, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.sm },
});
