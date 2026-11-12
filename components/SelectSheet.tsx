import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import type { IconName } from '@/types';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: IconName;
  /** Opción visible pero no seleccionable (p. ej. "Próximamente"). */
  disabled?: boolean;
  badge?: string;
}

interface SelectSheetProps {
  visible: boolean;
  title: string;
  options: readonly SelectOption[];
  selectedValue?: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
  footnote?: string;
}

/**
 * Hoja inferior de selección (mock: campos con "›" que abren un selector).
 * Reutilizable para categorías, fuentes, medios de pago, orden y período.
 */
export function SelectSheet({ visible, title, options, selectedValue, onSelect, onClose, footnote }: SelectSheetProps) {
  const { palette } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />
        <View style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <AppText variant="subtitle">{title}</AppText>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Cerrar" accessibilityRole="button">
              <Ionicons name="close" size={24} color={palette.textSecondary} />
            </Pressable>
          </View>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {options.map((option) => {
              const selected = option.value === selectedValue;
              const disabled = option.disabled === true;
              return (
                <Pressable
                  key={option.value}
                  disabled={disabled}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled }}
                  accessibilityLabel={option.label}
                  style={[
                    styles.option,
                    selected && { backgroundColor: palette.primarySoft },
                    disabled && styles.optionDisabled,
                  ]}
                >
                  {option.icon ? (
                    <View style={[styles.iconCircle, { backgroundColor: palette.cardPressed }]}>
                      <MaterialCommunityIcons name={option.icon} size={20} color={disabled ? palette.textTertiary : palette.primary} />
                    </View>
                  ) : null}
                  <View style={styles.optionText}>
                    <View style={styles.optionTitleRow}>
                      <AppText variant="body" weight={selected ? '700' : '500'} numberOfLines={1} style={disabled ? { color: palette.textTertiary } : undefined}>
                        {option.label}
                      </AppText>
                      {option.badge ? (
                        <AppText variant="caption" tone="tertiary">{option.badge}</AppText>
                      ) : null}
                    </View>
                    {option.description ? (
                      <AppText variant="caption" tone="tertiary" numberOfLines={2}>
                        {option.description}
                      </AppText>
                    ) : null}
                  </View>
                  {selected ? <Ionicons name="checkmark-circle" size={22} color={palette.primary} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
          {footnote ? (
            <AppText variant="caption" tone="tertiary" center style={styles.footnote}>
              {footnote}
            </AppText>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    maxHeight: '72%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: '#3D3D3D',
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footnote: {
    marginTop: spacing.xs,
  },
});
