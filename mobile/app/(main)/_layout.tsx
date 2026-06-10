import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Loading } from '../../src/components/ui/Loading';
import { useEffect } from 'react';
import { useHouseholdStore } from '../../src/store/householdStore';

export default function MainLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const fetchHousehold = useHouseholdStore((s) => s.fetchHousehold);
  const { colors } = useTheme();

  useEffect(() => {
    if (isAuthenticated) fetchHousehold();
  }, [isAuthenticated, fetchHousehold]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="emi" />
      <Stack.Screen name="household" />
      <Stack.Screen name="budgets" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="recurring" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}
