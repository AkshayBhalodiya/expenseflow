import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Screen } from '../../src/components/ui/Screen';
import { StackHeader } from '../../src/components/layout/StackHeader';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Loading } from '../../src/components/ui/Loading';
import { api } from '../../src/lib/api';
import { useHouseholdStore } from '../../src/store/householdStore';
import { useTheme } from '../../src/hooks/useTheme';
import { spacing } from '../../src/lib/theme';

export default function HouseholdScreen() {
  const { colors } = useTheme();
  const { household, fetchHousehold, invalidate } = useHouseholdStore();
  const [loading, setLoading] = useState(true);
  const [homeName, setHomeName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    fetchHousehold(true).finally(() => setLoading(false));
  }, [fetchHousehold]);

  const handleCreate = async () => {
    try {
      await api.createHousehold(homeName);
      invalidate();
      await fetchHousehold(true);
      setHomeName('');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create home');
    }
  };

  const handleJoin = async () => {
    try {
      await api.joinHousehold(inviteCode.toUpperCase());
      invalidate();
      await fetchHousehold(true);
      setInviteCode('');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Invalid invite code');
    }
  };

  const handleLeave = () => {
    Alert.alert('Leave Home', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          await api.leaveHousehold();
          invalidate();
          await fetchHousehold(true);
        },
      },
    ]);
  };

  const copyCode = async () => {
    if (household?.inviteCode) {
      await Clipboard.setStringAsync(household.inviteCode);
      Alert.alert('Copied', 'Invite code copied to clipboard');
    }
  };

  const shareCode = async () => {
    if (household?.inviteCode) {
      await Share.share({ message: `Join my ExpenseFlow home! Code: ${household.inviteCode}` });
    }
  };

  if (loading) return <Loading />;

  return (
    <Screen tabBar={false}>
      <StackHeader title="Home Share" subtitle="Manage shared household finances" />

      {household ? (
        <Card style={{ gap: spacing.md }}>
          <View style={styles.homeHeader}>
            <View style={[styles.homeIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="home" size={28} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.homeName, { color: colors.text }]}>{household.name}</Text>
              <Text style={{ color: colors.textSecondary }}>{household.members.length} members</Text>
            </View>
          </View>

          <View style={[styles.codeBox, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Invite Code</Text>
            <Text style={[styles.code, { color: colors.primary }]}>{household.inviteCode}</Text>
            <View style={styles.codeActions}>
              <Button title="Copy" variant="outline" onPress={copyCode} style={styles.codeBtn} />
              <Button title="Share" onPress={shareCode} style={styles.codeBtn} />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Members</Text>
          {household.members.map((m) => (
            <View key={m.userId} style={[styles.member, { borderColor: colors.border }]}>
              <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{m.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{m.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{m.email}</Text>
              </View>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{m.role}</Text>
            </View>
          ))}

          <Button title="Leave Home" variant="danger" onPress={handleLeave} />
        </Card>
      ) : (
        <View style={{ gap: spacing.md }}>
          <Card style={{ gap: spacing.sm }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Create a Home</Text>
            <Input label="Home Name" value={homeName} onChangeText={setHomeName} placeholder="My Family" />
            <Button title="Create Home" onPress={handleCreate} />
          </Card>
          <Card style={{ gap: spacing.sm }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Join a Home</Text>
            <Input label="Invite Code" value={inviteCode} onChangeText={setInviteCode} placeholder="ABC123" autoCapitalize="characters" />
            <Button title="Join Home" variant="outline" onPress={handleJoin} />
          </Card>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  homeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  homeIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  homeName: { fontSize: 22, fontWeight: '800' },
  codeBox: { padding: spacing.md, borderRadius: 12, alignItems: 'center' },
  code: { fontSize: 32, fontWeight: '800', letterSpacing: 4, marginVertical: spacing.sm },
  codeActions: { flexDirection: 'row', gap: spacing.sm },
  codeBtn: { paddingVertical: 8, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  member: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
