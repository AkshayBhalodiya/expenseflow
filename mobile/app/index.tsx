import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Loading } from '../src/components/ui/Loading';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <Loading />;

  if (isAuthenticated) {
    return <Redirect href="/(main)/(tabs)/" />;
  }

  return <Redirect href="/(auth)/login" />;
}
