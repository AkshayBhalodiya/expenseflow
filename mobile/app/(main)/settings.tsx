import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/ui/Screen';
import { StackHeader } from '../../src/components/layout/StackHeader';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Picker } from '../../src/components/ui/Picker';
import { api } from '../../src/lib/api';
import { CURRENCIES } from '../../src/lib/constants';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { spacing } from '../../src/lib/theme';

export default function SettingsScreen() {
  const { colors, toggle, isDark } = useTheme();
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ name, mobile, currency });
      setUser({ ...user!, name, mobile, currency });
      Alert.alert('Success', 'Profile updated');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Success', 'Password changed');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Password change failed');
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.exportUserData();
      Alert.alert('Export', 'Data exported successfully. Check your email or download from web.');
      console.log(res.data);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Export failed');
    }
  };

  return (
    <Screen tabBar={false}>
      <StackHeader title="Settings" subtitle="Manage your account" />

      <Card style={{ marginBottom: spacing.md, gap: spacing.sm }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
        <Input label="Name" value={name} onChangeText={setName} />
        <Input label="Email" value={user?.email || ''} editable={false} />
        <Input label="Mobile" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
        <Picker label="Currency" value={currency} options={CURRENCIES.map((c) => ({ value: c, label: c }))} onChange={setCurrency} />
        <Button title="Save Profile" onPress={handleSaveProfile} loading={saving} />
      </Card>

      <Card style={{ marginBottom: spacing.md, gap: spacing.sm }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
        <Input label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        <Input label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <Button title="Change Password" variant="outline" onPress={handleChangePassword} />
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Pressable onPress={toggle} style={styles.menuRow}>
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
        <Pressable onPress={handleExport} style={styles.menuRow}>
          <Ionicons name="download" size={22} color={colors.text} />
          <Text style={[styles.menuText, { color: colors.text }]}>Export My Data</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  menuText: { flex: 1, fontSize: 16 },
});
