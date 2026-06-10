import { Platform } from 'react-native';

export const colors = {
  light: {
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
    background: '#f1f5f9',
    surface: '#ffffff',
    surfaceSecondary: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    success: '#10b981',
    successBg: '#ecfdf5',
    danger: '#ef4444',
    dangerBg: '#fef2f2',
    warning: '#f59e0b',
    warningBg: '#fffbeb',
    info: '#3b82f6',
    infoBg: '#eff6ff',
    overlay: 'rgba(15, 23, 42, 0.45)',
    cardShadow: 'rgba(15, 23, 42, 0.06)',
    tabBarBg: '#ffffff',
    tabBarBorder: '#e2e8f0',
    gradient: ['#6366f1', '#8b5cf6'] as const,
  },
  dark: {
    primary: '#818cf8',
    primaryLight: '#a5b4fc',
    primaryDark: '#6366f1',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceSecondary: '#334155',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#334155',
    borderLight: '#1e293b',
    success: '#34d399',
    successBg: '#064e3b',
    danger: '#f87171',
    dangerBg: '#7f1d1d',
    warning: '#fbbf24',
    warningBg: '#78350f',
    info: '#60a5fa',
    infoBg: '#1e3a5f',
    overlay: 'rgba(0, 0, 0, 0.6)',
    cardShadow: 'rgba(0, 0, 0, 0.25)',
    tabBarBg: '#1e293b',
    tabBarBorder: '#334155',
    gradient: ['#6366f1', '#8b5cf6'] as const,
  },
};

export type ThemeColors = typeof colors.light;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const typography = {
  hero: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.8 },
  h1: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 18, fontWeight: '700' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 11, fontWeight: '500' as const },
};

export const layout = {
  screenPadding: spacing.lg,
  /** @deprecated use layout.tabBar + getTabBarOffset() */
  tabBarHeight: Platform.OS === 'ios' ? 88 : 76,
  tabBar: {
    contentHeight: 52,
    marginBottom: 0,
    marginTop: 4,
  },
  fab: {
    size: 54,
    offsetRight: 20,
    gapAboveTabBar: 14,
    stackBottom: 20,
    /** Extra scroll padding when FAB is visible on tab screens */
    contentInset: 72,
  },
  listGap: spacing.sm,
  sectionGap: spacing.lg,
};
