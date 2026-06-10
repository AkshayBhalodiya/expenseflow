import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { spacing, radius } from '../../src/lib/theme';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/(main)/(tabs)/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Start tracking your finances today
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerBg }]}>
                <Text style={{ color: colors.danger }}>{error}</Text>
              </View>
            ) : null}

            <Input label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" />
            <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
            <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Min 6 characters" />

            <Button title="Create Account" onPress={handleRegister} loading={isLoading} />

            <View style={styles.footer}>
              <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign in</Text>
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
  scroll: { padding: spacing.md, gap: spacing.md },
  back: { padding: spacing.sm, alignSelf: 'flex-start' },
  header: { paddingHorizontal: spacing.sm },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 15, marginTop: 4 },
  card: { padding: spacing.lg, borderRadius: radius.xl, gap: spacing.md },
  errorBox: { padding: spacing.md, borderRadius: radius.md },
  footer: { flexDirection: 'row', justifyContent: 'center' },
});
