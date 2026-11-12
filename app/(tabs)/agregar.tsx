import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FieldRow, SelectRow, TextRow } from '@/components/FieldRow';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { SelectSheet } from '@/components/SelectSheet';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { INCOME_SOURCES, PAYMENT_METHODS } from '@/constants/finance';
import { radius, spacing } from '@/constants/layout';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import type { PaymentMethodId } from '@/constants/finance';
import { parseAmount, sanitizeAmountInput } from '@/utils/currency';
import { defaultDateForMonth, formatISODateFullEs, fromISODate, toISODate } from '@/utils/date';
import { MAX_NOTE_LENGTH } from '@/utils/validation';

/** Monto con miles con punto, p. ej. "42.500" o "1.250,50". */
export function formatAmountDisplay(raw: string): string {
  const clean = sanitizeAmountInput(raw);
  if (clean === '') {
    return '';
  }
  const hasComma = clean.includes(',');
  const [intPartRaw, ...fracParts] = clean.split(',');
  const intDigits = intPartRaw.replace(/\D/g, '').slice(0, 9);
  const grouped = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const frac = fracParts.join('').replace(/\D/g, '').slice(0, 2);
  return hasComma ? `${grouped},${frac}` : grouped;
}

function initialType(param: string | string[] | undefined): 'gasto' | 'ingreso' {
  return param === 'ingreso' ? 'ingreso' : 'gasto';
}

export default function AgregarScreen() {
  const params = useLocalSearchParams<{ tipo?: string; id?: string; month?: string; fuente?: string }>();
  // Al cambiar tipo/id/fuente desde afuera se remonta el formulario con los
  // datos cargados (evita estados viejos al editar registros distintos).
  const formKey = `${params.tipo ?? ''}|${params.id ?? ''}|${params.month ?? ''}|${params.fuente ?? ''}`;
  return <AgregarForm key={formKey} />;
}

function AgregarForm() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tipo?: string; id?: string; month?: string; fuente?: string }>();
  const { palette, isDark } = useAppTheme();

  const monthKey = useMonthStore((state) => state.monthKey);
  const categories = useFinanceStore((state) => state.categories);
  const expenseIncomes = useFinanceStore((state) => state.incomes);
  const addIncome = useFinanceStore((state) => state.addIncome);
  const updateIncome = useFinanceStore((state) => state.updateIncome);
  const expenses = useExpenseStore((state) => state.expenses);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const updateExpense = useExpenseStore((state) => state.updateExpense);

  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>(() => initialType(params.tipo));
  const isEdit = typeof params.id === 'string' && params.id.length > 0;

  const editingExpense = useMemo(
    () =>
      isEdit && initialType(params.tipo) === 'gasto'
        ? expenses.find((expense) => expense.id === params.id)
        : undefined,
    [expenses, params.id, isEdit, params.tipo],
  );
  const editingIncome = useMemo(
    () =>
      isEdit && initialType(params.tipo) === 'ingreso'
        ? expenseIncomes.find((income) => income.id === params.id)
        : undefined,
    [expenseIncomes, params.id, isEdit, params.tipo],
  );
  const isEditingExisting = Boolean(editingExpense || editingIncome);

  // En creación, la pantalla del mock preselecciona Alimentación / Sueldo.
  const [amountRaw, setAmountRaw] = useState<string>(() => {
    const existing = editingExpense?.amount ?? editingIncome?.amount;
    return existing != null ? formatAmountDisplay(String(existing).replace('.', ',')) : '';
  });
  const [concepto, setConcepto] = useState<string>(() =>
    editingExpense?.note ?? editingIncome?.note ?? '',
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    () => editingExpense?.category ?? (isEdit ? null : 'food'),
  );
  const [sourceId, setSourceId] = useState<string | null>(() =>
    typeof params.fuente === 'string'
      ? params.fuente
      : editingIncome?.source ?? (isEdit ? null : 'sueldo'),
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>(
    () => (editingExpense?.paymentMethod ?? editingIncome?.paymentMethod ?? 'tarjeta-debito') as PaymentMethodId,
  );
  const [date, setDate] = useState<string>(
    () => editingExpense?.date ?? editingIncome?.date
      ?? (params.month ? defaultDateForMonth(params.month) : defaultDateForMonth(monthKey)),
  );
  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string }>({});
  const [picker, setPicker] = useState<'categoria' | 'fuente' | 'medio' | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);

  // Al cambiar entre Gasto/Ingreso en modo creación, no arrastrar datos.
  const switchTipo = (next: 'gasto' | 'ingreso') => {
    if (next === tipo || isEdit) return;
    setTipo(next);
    setErrors({});
  };

  const amountValue = useMemo(
    () => parseAmount(amountRaw),
    [amountRaw],
  );
  const amountValid = amountValue !== null;
  const selectionValid = tipo === 'gasto' ? categoryId !== null : sourceId !== null;

  // El formulario se remonta vía key cuando cambian los parámetros externos
  // (ver AgregarScreen), por lo que el tipo inicial siempre es consistente.

  const headerTitle = isEdit
    ? tipo === 'gasto'
      ? 'Editar gasto'
      : 'Editar ingreso'
    : tipo === 'gasto'
      ? 'Nuevo gasto'
      : 'Nuevo ingreso';

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => (category.type ?? 'gasto') === 'gasto')
        .map((category) => ({
          value: category.id,
          label: category.name,
          icon: category.icon,
        })),
    [categories],
  );

  const sourceOptions = useMemo(
    () => [
      ...INCOME_SOURCES.map((source) => ({
        value: source.id,
        label: source.label,
        description: source.description,
        icon: source.icon as typeof INCOME_SOURCES[number]['icon'],
      })),
      ...categories
        .filter((category) => category.type === 'ingreso')
        .map((category) => ({
          value: category.id,
          label: category.name,
          description: 'Categoría personalizada',
          icon: category.icon,
        })),
    ],
    [categories],
  );

  const paymentOptions = useMemo(
    () =>
      PAYMENT_METHODS.map((method) => ({
        value: method.id as string,
        label: method.label,
        icon: method.icon,
      })),
    [],
  );

  const resetForm = () => {
    setAmountRaw('');
    setConcepto('');
    setDate(defaultDateForMonth(monthKey));
    setErrors({});
  };

  const handleSubmit = () => {
    const nextErrors: { amount?: string; category?: string; date?: string } = {};
    if (!amountValid) {
      nextErrors.amount = 'Ingresá un monto válido';
    }
    if (!selectionValid) {
      nextErrors.category = tipo === 'gasto' ? 'Elegí una categoría' : 'Elegí una fuente';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    const note = concepto.trim() === '' ? undefined : concepto.trim();
    const resolvedAmount = amountValue as number;

    if (tipo === 'gasto') {
      if (isEdit && editingExpense) {
        updateExpense(editingExpense.id, {
          amount: resolvedAmount,
          category: categoryId as string,
          date,
          note,
          paymentMethod,
        });
        router.back();
        return;
      }
      const created = addExpense({ amount: resolvedAmount, category: categoryId as string, date, note, paymentMethod });
      resetForm();
      router.replace(`/gasto-guardado?id=${created.id}&tipo=gasto`);
      return;
    }

    if (isEdit && editingIncome) {
      updateIncome(editingIncome.id, {
        amount: resolvedAmount,
        source: sourceId as string,
        date,
        note,
        paymentMethod,
      });
      router.back();
      return;
    }
    const created = addIncome({ amount: resolvedAmount, source: sourceId as string, date, note, paymentMethod });
    resetForm();
    router.replace(`/gasto-guardado?id=${created.id}&tipo=ingreso`);
  };

  // Modo edición con el registro eliminado: pantalla vacía como otros detalles.
  if (isEdit && !isEditingExisting) {
    return (
      <Screen scroll>
        <Header title="Movimiento" />
        <EmptyState
          icon="help-circle-outline"
          title="Movimiento no encontrado"
          message="El movimiento que querés editar ya no existe."
          action={<Button label="Volver" variant="secondary" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  const conceptPlaceholder = tipo === 'gasto' ? 'Supermercado' : 'Proyecto freelance';
  const categoryLabel = 'Categoría';
  const categoryValue = tipo === 'gasto'
    ? categories.find((category) => category.id === categoryId)?.name ?? 'Alimentación'
    : INCOME_SOURCES.find((source) => source.id === sourceId)?.label
      ?? categories.find((category) => category.id === sourceId)?.name
      ?? 'Elegir…';

  const paymentLabel = PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.label ?? 'Tarjeta de débito';

  const dateObject = fromISODate(date);

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setDateOpen(false);
      if (event.type === 'set' && selected) {
        setDate(toISODate(selected));
      }
    } else if (selected) {
      setDate(toISODate(selected));
    }
  };

  return (
    <Screen scroll keyboardAware>
      <Header title={headerTitle} />

      <View style={styles.content}>
        {/* Selector Gasto / Ingreso */}
        <View style={styles.segment} accessibilityRole="tablist">
          {(['gasto', 'ingreso'] as const).map((option) => {
            const active = option === tipo;
            return (
              <PressableScale
                key={option}
                onPress={() => switchTipo(option)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active, disabled: isEdit }}
                accessibilityLabel={option === 'gasto' ? 'Gasto' : 'Ingreso'}
                style={[
                  styles.segmentOption,
                  active
                    ? { backgroundColor: palette.primary }
                    : { backgroundColor: 'transparent' },
                  isEdit && styles.segmentDisabled,
                ]}
              >
                <AppText
                  variant="label"
                  weight="700"
                  style={{ color: active ? palette.onPrimary : palette.textSecondary }}
                >
                  {option === 'gasto' ? 'Gasto' : 'Ingreso'}
                </AppText>
              </PressableScale>
            );
          })}
        </View>

        {/* Monto */}
        <View>
          <AppText variant="caption" weight="700" tone="accent" style={styles.amountLabel}>
            MONTO EN PESOS
          </AppText>
          <View
            style={[
              styles.amountField,
              {
                borderBottomColor: errors.amount
                  ? palette.danger
                  : amountFocused
                    ? palette.primary
                    : palette.border,
              },
            ]}
          >
            <AppText variant="hero" weight="800" style={styles.amountCurrency}>
              $
            </AppText>
            <TextInput
              testID="add-amount-input"
              value={amountRaw}
              onChangeText={(text) => {
                setAmountRaw(formatAmountDisplay(text));
                setErrors((current) => ({ ...current, amount: undefined }));
              }}
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={palette.textTertiary}
              returnKeyType="done"
              accessibilityLabel="Monto en pesos"
              style={[styles.amountInput, { color: palette.textPrimary }]}
            />
          </View>
          {errors.amount ? (
            <AppText variant="caption" tone="danger" style={styles.fieldError}>
              {errors.amount}
            </AppText>
          ) : null}
        </View>

        <TextRow
          label="Concepto"
          value={concepto}
          onChangeText={(text) => setConcepto(text.slice(0, MAX_NOTE_LENGTH))}
          placeholder={conceptPlaceholder}
          maxLength={MAX_NOTE_LENGTH}
        />

        <SelectRow
          label={categoryLabel}
          value={categoryValue}
          onPress={() => setPicker(tipo === 'gasto' ? 'categoria' : 'fuente')}
          error={errors.category}
          accessibilityLabel={`${categoryLabel}: ${categoryValue}`}
        />

        <FieldRow label="Fecha">
          <PressableScale
            onPress={() => setDateOpen(true)}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel={`Fecha: ${formatISODateFullEs(date)}`}
            style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <AppText variant="body" weight="500" numberOfLines={1} style={styles.rowValue}>
              {formatISODateFullEs(date)}
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
          </PressableScale>
        </FieldRow>

        <SelectRow
          label="Medio de pago"
          value={paymentLabel}
          onPress={() => setPicker('medio')}
        />

        <Button
          label={isEdit
            ? 'Guardar cambios'
            : tipo === 'gasto'
              ? 'Guardar gasto'
              : 'Guardar ingreso'}
          onPress={handleSubmit}
          style={styles.submitButton}
        />
        <AppText variant="caption" tone="tertiary" center>
          Podés editarlo después desde el detalle.
        </AppText>
      </View>

      {/* Selectores */}
      <SelectSheet
        visible={picker === 'categoria' || picker === 'fuente'}
        title={tipo === 'gasto' ? 'Categoría' : 'Categoría'}
        options={tipo === 'gasto' ? categoryOptions : sourceOptions}
        selectedValue={tipo === 'gasto' ? categoryId : sourceId}
        onSelect={(value) => {
          if (tipo === 'gasto') {
            setCategoryId(value);
          } else {
            setSourceId(value);
          }
          setErrors((current) => ({ ...current, category: undefined }));
        }}
        onClose={() => setPicker(null)}
      />
      <SelectSheet
        visible={picker === 'medio'}
        title="Medio de pago"
        options={paymentOptions}
        selectedValue={paymentMethod}
        onSelect={(value) => setPaymentMethod(value as PaymentMethodId)}
        onClose={() => setPicker(null)}
      />

      {/* Selector de fecha */}
      {Platform.OS === 'android' && dateOpen ? (
        <DateTimePicker
          value={Number.isNaN(dateObject.getTime()) ? new Date() : dateObject}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date(2100, 11, 31)}
          themeVariant={isDark ? 'dark' : 'light'}
          accessibilityLabel="Fecha"
        />
      ) : null}
      {Platform.OS === 'ios' ? (
        <Modal visible={dateOpen} transparent animationType="slide" onRequestClose={() => setDateOpen(false)}>
          <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
            <Pressable style={styles.backdrop} onPress={() => setDateOpen(false)} accessibilityLabel="Cancelar" />
            <View style={[styles.dateSheet, { backgroundColor: palette.card }]}>
              <AppText variant="subtitle" style={styles.dateSheetTitle}>Elegí una fecha</AppText>
              <DateTimePicker
                value={Number.isNaN(dateObject.getTime()) ? new Date() : dateObject}
                mode="date"
                display="inline"
                onChange={handleDateChange}
                maximumDate={new Date(2100, 11, 31)}
                themeVariant={isDark ? 'dark' : 'light'}
                accessibilityLabel="Fecha"
              />
              <Button label="Listo" onPress={() => setDateOpen(false)} />
            </View>
          </View>
        </Modal>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  segment: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#222222',
    borderRadius: radius.full,
    padding: 4,
    gap: 4,
  },
  segmentOption: {
    minWidth: 96,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  segmentDisabled: {
    opacity: 0.7,
  },
  amountLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  amountField: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    borderBottomWidth: 1.5,
    paddingBottom: spacing.sm,
  },
  amountCurrency: {
    paddingBottom: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -0.5,
    padding: 0,
    paddingTop: 0,
  },
  fieldError: {
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
  rowValue: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.sm,
    minHeight: 56,
  },
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
  dateSheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  dateSheetTitle: {
    marginBottom: spacing.xs,
  },
});
