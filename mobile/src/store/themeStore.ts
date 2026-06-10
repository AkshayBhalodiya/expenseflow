import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, ThemeColors } from '../lib/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      colors: colors.light,
      toggle: () => {
        const next = get().mode === 'light' ? 'dark' : 'light';
        set({ mode: next, colors: colors[next] });
      },
      setMode: (mode) => set({ mode, colors: colors[mode] }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.colors = colors[state.mode];
        }
      },
    }
  )
);
