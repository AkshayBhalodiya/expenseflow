import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { api } from '../../src/lib/api';
import { useTheme } from '../../src/hooks/useTheme';
import { spacing } from '../../src/lib/theme';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setMessage(res.message || 'Reset link sent to your email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={[styles.flex, styles.pad]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={[styles.title, { color: colors.text }]}>Forgot Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your email and we&apos;ll send a reset link
        </Text>

        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        {message ? <Text style={{ color: colors.success }}>{message}</Text> : null}

        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { padding: spacing.lg, gap: spacing.md },
  back: { marginBottom: spacing.md },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14 },
});
