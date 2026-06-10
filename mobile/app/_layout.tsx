import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../src/hooks/useTheme';
import { useAuthStore } from '../src/store/authStore';
import { loadTokens } from '../src/lib/tokenStorage';

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  useEffect(() => {
    loadTokens().then(() => fetchProfile());
  }, [fetchProfile]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
