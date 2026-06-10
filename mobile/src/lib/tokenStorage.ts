import AsyncStorage from '@react-native-async-storage/async-storage';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let loaded = false;

export async function loadTokens(): Promise<void> {
  if (loaded) return;
  const [access, refresh] = await Promise.all([
    AsyncStorage.getItem('accessToken'),
    AsyncStorage.getItem('refreshToken'),
  ]);
  accessToken = access;
  refreshToken = refresh;
  loaded = true;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export async function setTokens(access: string, refresh?: string): Promise<void> {
  accessToken = access;
  await AsyncStorage.setItem('accessToken', access);
  if (refresh) {
    refreshToken = refresh;
    await AsyncStorage.setItem('refreshToken', refresh);
  }
  loaded = true;
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  refreshToken = null;
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
}
