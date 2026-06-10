import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ViewMode = 'personal' | 'household';

interface ViewState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      viewMode: 'personal',
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'view-mode',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
