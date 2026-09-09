import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { formatISODate, fromISODate, toISODate, todayISO } from '@/utils/date';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const { palette, isDark } = useAppTheme();
  const [open, setOpen] = useState(false);

  const date = !Number.isNaN(fromISODate(value).getTime()) ? fromISODate(value) : fromISODate(todayISO());
  const borderColor = error ? palette.danger : palette.border;

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setOpen(false);
      if (event.type === 'set' && selected) {
        onChange(toISODate(selected));
      }
    } else if (selected) {
      onChange(toISODate(selected));
    }
  };

  const picker = (
    <DateTimePicker
      value={date}
      mode="date"
      display={Platform.OS === 'ios' ? 'inline' : 'default'}
      onChange={handleChange}
      maximumDate={new Date(2100, 11, 31)}
      themeVariant={isDark ? 'dark' : 'light'}
      accessibilityLabel={label}
    />
  );

  return (
    <View>
      <AppText variant="label" tone="secondary" style={styles.marginBottom}>
        {label}
      </AppText>

      <PressableScale
        onPress={() => setOpen(true)}
        scaleTo={0.98}
        style={[
          styles.field,
          {
            backgroundColor: palette.card,
            borderColor,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons name="calendar-outline" size={20} color={palette.textSecondary} />
        <AppText variant="body" style={styles.flex}>
          {formatISODate(value)}
        </AppText>
        <Ionicons name="chevron-down" size={18} color={palette.textTertiary} />
      </PressableScale>

      {error ? (
        <AppText variant="caption" tone="danger" style={styles.marginTop}>
          {error}
        </AppText>
      ) : null}

      {Platform.OS === 'android' && open ? picker : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={open}
          transparent
          animationType="slide"
          onRequestClose={() => setOpen(false)}
        >
          <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
            <PressableScale
              style={styles.modalBackdrop}
              onPress={() => setOpen(false)}
              scaleTo={1}
              pressedOpacity={1}
              accessibilityLabel="Cancelar"
            />
            <View style={[styles.sheet, { backgroundColor: palette.card }]}>
              <View style={styles.sheetHeader}>
                <AppText variant="subtitle">Seleccionar fecha</AppText>
                <PressableScale
                  onPress={() => setOpen(false)}
                  hitSlop={12}
                  pressedOpacity={0.5}
                  accessibilityLabel="Cancelar"
                >
                  <Ionicons name="close" size={24} color={palette.textSecondary} />
                </PressableScale>
              </View>
              {picker}
              <Button label="Listo" size="sm" onPress={() => setOpen(false)} style={styles.doneButton} />
            </View>
          </View>
        </Modal>
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
  flex: {
    flex: 1,
  },
  field: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doneButton: {
    alignSelf: 'stretch',
  },
});