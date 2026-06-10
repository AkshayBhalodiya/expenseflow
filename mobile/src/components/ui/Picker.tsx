import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { radius, spacing } from '../../lib/theme';

interface PickerProps {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function Picker({ label, value, options, onChange }: PickerProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.trigger, { backgroundColor: colors.surfaceSecondary, borderColor: 'transparent' }]}
      >
        <Text style={{ color: colors.text, flex: 1, fontSize: 16 }}>{selected?.label || value}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide">
        <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{label || 'Select'}</Text>
            <ScrollView style={styles.options}>
              {options.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    opt.value === value && { backgroundColor: colors.primary + '12' },
                  ]}
                >
                  <Text
                    style={{
                      color: opt.value === value ? colors.primary : colors.text,
                      fontWeight: opt.value === value ? '700' : '400',
                      fontSize: 16,
                    }}
                  >
                    {opt.label}
                  </Text>
                  {opt.value === value && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', marginLeft: 2 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingBottom: spacing.xl, maxHeight: '55%' },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  sheetTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: spacing.sm },
  options: { paddingHorizontal: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: 2,
  },
});
