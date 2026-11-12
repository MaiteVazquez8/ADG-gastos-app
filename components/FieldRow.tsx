import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';

interface FieldRowProps {
  label: string;
  error?: string | null;
  children: ReactNode;
}

/** Etiqueta arriba + fila oscura, como los campos del mock. */
export function FieldRow({ label, error, children }: FieldRowProps) {
  return (
    <View>
      <AppText variant="label" tone={error ? 'danger' : 'secondary'} style={styles.label}>
        {label}
      </AppText>
      {children}
      {error ? (
        <AppText variant="caption" tone="danger" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

interface SelectRowProps {
  label: string;
  value: string;
  onPress: () => void;
  error?: string | null;
  accessibilityLabel?: string;
}

/** Fila de selección "Alimentación ›" del mock. */
export function SelectRow({ label, value, onPress, error, accessibilityLabel }: SelectRowProps) {
  const { palette } = useAppTheme();

  return (
    <FieldRow label={label} error={error}>
      <PressableScale
        onPress={onPress}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
        style={[
          styles.row,
          {
            backgroundColor: palette.card,
            borderColor: error ? palette.danger : palette.border,
          },
        ]}
      >
        <AppText variant="body" weight="500" numberOfLines={1} style={styles.value}>
          {value}
        </AppText>
        <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
      </PressableScale>
    </FieldRow>
  );
}

interface TextRowProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  keyboardType?: 'default' | 'decimal-pad';
  maxLength?: number;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
}

/** Fila de texto libre (mock: "Concepto"). */
export function TextRow({ label, value, onChangeText, placeholder, error, keyboardType = 'default', maxLength, autoFocus, onSubmitEditing }: TextRowProps) {
  const { palette } = useAppTheme();

  return (
    <FieldRow label={label} error={error}>
      <View
        style={[
          styles.row,
          {
            backgroundColor: palette.card,
            borderColor: error ? palette.danger : palette.border,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.textTertiary}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="done"
          accessibilityLabel={label}
          style={[styles.input, { color: palette.textPrimary }]}
        />
      </View>
    </FieldRow>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
  },
  error: {
    marginTop: spacing.xs,
  },
  row: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  value: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    padding: 0,
  },
});
