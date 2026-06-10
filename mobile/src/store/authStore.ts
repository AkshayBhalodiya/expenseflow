import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, User } from '../lib/api';
import * as tokenStorage from '../lib/tokenStorage';

const PROFILE_TTL_MS = 5 * 60 * 1000;
let profilePromise: Promise<void> | null = null;
let lastProfileFetch = 0;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: (force?: boolean) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.login(email, password);
          await tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
          lastProfileFetch = Date.now();
          set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.register(name, email, password);
          await tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
          lastProfileFetch = Date.now();
          set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch {
          // ignore
        }
        await api.clearTokens();
        lastProfileFetch = 0;
        profilePromise = null;
        set({ user: null, isAuthenticated: false });
      },

      fetchProfile: async (force = false) => {
        const { user, isAuthenticated } = get();
        if (!force && user && isAuthenticated && Date.now() - lastProfileFetch < PROFILE_TTL_MS) {
          return;
        }
        if (!force && profilePromise) return profilePromise;

        profilePromise = api
          .getProfile()
          .then((res) => {
            lastProfileFetch = Date.now();
            set({ user: res.data, isAuthenticated: true });
          })
          .catch(async () => {
            await api.clearTokens();
            lastProfileFetch = 0;
            set({ user: null, isAuthenticated: false });
          })
          .finally(() => {
            profilePromise = null;
          });

        return profilePromise;
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
