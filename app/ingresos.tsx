import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { DateField } from '@/components/DateField';
import { EmptyState } from '@/components/EmptyState';
import { FilterTabs } from '@/components/FilterTabs';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { INCOME_SOURCES } from '@/constants/finance';
import { fontSize, radius, spacing } from '@/constants/layout';
import { useFinanceStore } from '@/store/useFinanceStore';
import type { NewIncome } from '@/types';
import { parseAmount, sanitizeAmountInput } from '@/utils/currency';
import { defaultDateForMonth, todayISO } from '@/utils/date';
import { MAX_NOTE_LENGTH, validateIncomeForm } from '@/utils/validation';

export default function IncomeScreen() {
  const router = useRouter();
  const { id, month } = useLocalSearchParams<{ id?: string; month?: string }>();
  const { palette } = useAppTheme();

  const incomes = useFinanceStore((state) => state.incomes);
  const addIncome = useFinanceStore((state) => state.addIncome);
  const updateIncome = useFinanceStore((state) => state.updateIncome);
  const deleteIncome = useFinanceStore((state) => state.deleteIncome);

  const isEdit = typeof id === 'string' && id.length > 0;
  const existing = useMemo(
    () => (isEdit ? incomes.find((income) => income.id === id) : undefined),
    [incomes, id, isEdit],
  );

  const [amount, setAmount] = useState<string>(
    existing?.amount != null ? String(existing.amount) : '',
  );
  const [source, setSource] = useState<string | null>(existing?.source ?? null);
  const [date, setDate] = useState<string>(
    existing?.date ?? (month ? defaultDateForMonth(month) : todayISO()),
  );
  const [note, setNote] = useState<string>(existing?.note ?? '');
  const [errors, setErrors] = useState<ReturnType<typeof validateIncomeForm>>(null);
  const [amountFocused, setAmountFocused] = useState(false);

  const clearError = (key: keyof NonNullable<ReturnType<typeof validateIncomeForm>>) => {
    setErrors((current) => {
      if (!current) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return Object.keys(next).length > 0 ? next : null;
    });
  };

  const handleSubmit = () => {
    setErrors(null);
    const nextErrors = validateIncomeForm({ amount, source, date, note });
    if (nextErrors) {
      setErrors(nextErrors);
      return;
    }
    const parsedAmount = parseAmount(amount);
    if (parsedAmount === null) {
      return;
    }
    const input: NewIncome = {
      amount: parsedAmount,
      source: source as string,
      date,
      note: note.trim() === '' ? undefined : note.trim(),
    };
    if (isEdit && existing) {
      updateIncome(existing.id, input);
    } else {
      addIncome(input);
    }
    router.back();
  };

  const confirmDelete = () => {
    if (!existing) {
      return;
    }
    Alert.alert('Eliminar ingreso', 'Este ingreso se eliminará definitivamente. Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteIncome(existing.id);
          router.back();
        },
      },
    ]);
  };

  if (isEdit && !existing) {
    return (
      <Screen scroll>
        <Header title="Editar ingreso" showBack />
        <EmptyState
          icon="help-circle-outline"
          title="Ingreso no encontrado"
          message="El ingreso que querés editar ya no existe."
          action={<Button label="Volver" variant="secondary" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  const sourceOptions = INCOME_SOURCES.map((s) => ({ label: s.label, value: s.id }));

  return (
    <Screen scroll keyboardAware>
      <Header
        title={isEdit ? 'Editar ingreso' : 'Nuevo ingreso'}
        showBack
        right={
          isEdit ? (
            <PressableScale
              onPress={confirmDelete}
              pressedOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel="Eliminar ingreso"
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={22} color={palette.danger} />
            </PressableScale>
          ) : undefined
        }
      />

      <View style={styles.content}>
        <View>
          <AppText variant="label" tone="secondary" style={styles.marginBottom}>
            Monto
          </AppText>
          <View
            style={[
              styles.amountField,
              {
                backgroundColor: palette.card,
                borderColor: errors?.amount ? palette.danger : amountFocused ? palette.primary : palette.border,
              },
            ]}
          >
            <AppText variant="hero" weight="700" tone="secondary">
              $
            </AppText>
            <TextInput
              value={amount}
              onChangeText={(text) => {
                setAmount(sanitizeAmountInput(text));
                clearError('amount');
              }}
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={palette.textTertiary}
              returnKeyType="done"
              accessibilityLabel="Monto"
              style={[styles.amountInput, { color: palette.textPrimary }]}
            />
          </View>
          {errors?.amount ? (
            <AppText variant="caption" tone="danger" style={styles.marginTop}>
              {errors.amount}
            </AppText>
          ) : null}
        </View>

        <View>
          <AppText variant="label" tone="secondary" style={styles.marginBottom}>
            Fuente
          </AppText>
          <FilterTabs options={sourceOptions} selected={source ?? ''} onSelect={(value) => {
            setSource(value);
            clearError('source');
          }} />
          {errors?.source ? (
            <AppText variant="caption" tone="danger" style={styles.marginTop}>
              {errors.source}
            </AppText>
          ) : null}
        </View>

        <TextField
          label="Descripción"
          value={note}
          onChangeText={setNote}
          placeholder="Opcional: origen del dinero"
          multiline
          maxLength={MAX_NOTE_LENGTH}
          suffix={
            <AppText variant="caption" tone="tertiary">
              {note.length}/{MAX_NOTE_LENGTH}
            </AppText>
          }
        />

        <DateField
          label="Fecha"
          value={date}
          onChange={(next) => {
            setDate(next);
            clearError('date');
          }}
          error={errors?.date}
        />

        <Button
          label={isEdit ? 'Guardar cambios' : 'Agregar ingreso'}
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  marginBottom: {
    marginBottom: spacing.sm,
  },
  marginTop: {
    marginTop: spacing.xs,
  },
  amountField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingLeft: spacing.lg,
  },
  amountInput: {
    flex: 1,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    padding: 0,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});