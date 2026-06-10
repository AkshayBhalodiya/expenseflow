import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { spacing, radius } from '../../src/lib/theme';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      await login(email.trim(), password);
      router.replace('/(main)/(tabs)/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={[...colors.gradient]} style={styles.hero}>
            <View style={styles.logoWrap}>
              <Ionicons name="wallet" size={40} color="#fff" />
            </View>
            <Text style={styles.brand}>ExpenseFlow</Text>
            <Text style={styles.tagline}>Smart personal finance</Text>
          </LinearGradient>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to manage your finances
            </Text>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerBg }]}>
                <Text style={{ color: colors.danger }}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter password"
            />

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable style={styles.forgot}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Forgot password?</Text>
              </Pressable>
            </Link>

            <Button title="Sign In" onPress={handleLogin} loading={isLoading} style={{ marginTop: spacing.sm }} />

            <View style={styles.footer}>
              <Text style={{ color: colors.textSecondary }}>Don&apos;t have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Create account</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: { padding: spacing.xl, paddingTop: 48, paddingBottom: 40, alignItems: 'center' },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brand: { fontSize: 28, fontWeight: '800', color: '#fff' },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  card: {
    margin: spacing.md,
    marginTop: -20,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: -8 },
  errorBox: { padding: spacing.md, borderRadius: radius.md },
  forgot: { alignSelf: 'flex-end' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
});
