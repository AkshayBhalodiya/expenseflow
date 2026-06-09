import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    { name: 'view-mode' }
  )
);
