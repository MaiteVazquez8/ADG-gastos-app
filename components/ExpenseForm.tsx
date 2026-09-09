import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { CategoryPicker } from '@/components/CategoryPicker';
import { DateField } from '@/components/DateField';
import { TextField } from '@/components/TextField';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { fontSize, radius, spacing } from '@/constants/layout';
import { useFinanceStore } from '@/store/useFinanceStore';
import type { Expense, NewExpense } from '@/types';
import { sanitizeAmountInput, parseAmount } from '@/utils/currency';
import { todayISO } from '@/utils/date';
import { MAX_NOTE_LENGTH, validateExpenseForm } from '@/utils/validation';

interface ExpenseFormProps {
  /** When provided, the form initializes with this expense (edit mode). */
  initialExpense?: Expense;
  /** Default date for a new expense, typically derived from the month being viewed. */
  defaultDate?: string;
  submitLabel: string;
  onSubmit: (input: NewExpense) => void;
  submitting?: boolean;
}

export function ExpenseForm({
  initialExpense,
  defaultDate,
  submitLabel,
  onSubmit,
  submitting = false,
}: ExpenseFormProps) {
  const { palette } = useAppTheme();
  const categories = useFinanceStore((state) => state.categories);

  const [amount, setAmount] = useState<string>(
    initialExpense?.amount != null ? String(initialExpense.amount) : '',
  );
  const [category, setCategory] = useState<string | null>(initialExpense?.category ?? null);
  const [date, setDate] = useState<string>(initialExpense?.date ?? defaultDate ?? todayISO());
  const [note, setNote] = useState<string>(initialExpense?.note ?? '');
  const [errors, setErrors] = useState<ReturnType<typeof validateExpenseForm>>(null);
  const [amountFocused, setAmountFocused] = useState(false);

  const clearError = (key: keyof NonNullable<ReturnType<typeof validateExpenseForm>>) => {
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
    const nextErrors = validateExpenseForm({ amount, category, date, note }, categories);
    if (nextErrors) {
      setErrors(nextErrors);
      return;
    }
    const parsedAmount = parseAmount(amount);
    if (parsedAmount === null) {
      return;
    }
    onSubmit({
      amount: parsedAmount,
      category: category as string,
      date,
      note: note.trim() === '' ? undefined : note.trim(),
    });
  };

  return (
    <View style={styles.container}>
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
            testID="expense-form-amount"
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

      <CategoryPicker
        categories={categories}
        value={category}
        onChange={(next) => {
          setCategory(next);
          clearError('category');
        }}
        error={errors?.category}
      />

      <TextField
        label="Descripción"
        value={note}
        onChangeText={setNote}
        placeholder="¿Para qué fue?"
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
        label={submitLabel}
        onPress={handleSubmit}
        loading={submitting}
        style={styles.submitButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  marginBottom: {
    marginBottom: spacing.xs,
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