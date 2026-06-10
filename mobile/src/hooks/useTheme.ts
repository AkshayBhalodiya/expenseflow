import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const colors = useThemeStore((s) => s.colors);
  const toggle = useThemeStore((s) => s.toggle);
  const setMode = useThemeStore((s) => s.setMode);
  const isDark = mode === 'dark';
  return { mode, colors, toggle, setMode, isDark };
}
