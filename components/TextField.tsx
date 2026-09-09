import { useState, type ReactNode } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  hint?: string;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  multiline?: boolean;
  maxLength?: number;
  /** Optional leading element rendered inside the input, e.g. a currency symbol. */
  prefix?: ReactNode;
  /** Optional trailing element, e.g. a character counter. */
  suffix?: ReactNode;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function TextField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  hint,
  keyboardType = 'default',
  returnKeyType,
  multiline = false,
  maxLength,
  prefix,
  suffix,
  autoFocus = false,
  onSubmitEditing,
  style,
  testID,
}: TextFieldProps) {
  const { palette } = useAppTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? palette.danger
    : focused
      ? palette.primary
      : palette.border;

  return (
    <View style={style}>
      <AppText variant="label" tone="secondary" style={styles.marginBottom}>
        {label}
      </AppText>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: palette.card,
            borderColor,
            minHeight: multiline ? 96 : 52,
          },
        ]}
      >
        {prefix ? <View>{prefix}</View> : null}
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={palette.textTertiary}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          multiline={multiline}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={label}
          style={[
            styles.input,
            {
              color: palette.textPrimary,
              textAlignVertical: multiline ? 'top' : 'center',
            },
          ]}
        />
        {suffix ? <View>{suffix}</View> : null}
      </View>

      {error ? (
        <AppText variant="caption" tone="danger" style={styles.marginTop}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" tone="tertiary" style={styles.marginTop}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  marginBottom: {
    marginBottom: spacing.xs,
  },
  marginTop: {
    marginTop: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    padding: 0,
  },
});