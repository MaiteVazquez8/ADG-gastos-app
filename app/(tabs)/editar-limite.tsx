import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { FieldRow, SelectRow } from '@/components/FieldRow';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { SelectSheet } from '@/components/SelectSheet';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { useBudgetStore, resolveMonthLimits } from '@/store/useBudgetStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import { parseAmount, sanitizeAmountInput } from '@/utils/currency';
import { formatMonthLabel } from '@/utils/date';

export default function EditarLimiteScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();
  const { categoria } = useLocalSearchParams<{ categoria?: string }>();

  const monthKey = useMonthStore((state) => state.monthKey);
  const setMonthKey = useMonthStore((state) => state.setMonthKey);
  const categories = useFinanceStore((state) => state.categories);
  const limitsByMonth = useBudgetStore((state) => state.limitsByMonth);
  const setMonthLimit = useBudgetStore((state) => state.setMonthLimit);

  const expenseCategories = useMemo(
    () => categories.filter((category) => (category.type ?? 'gasto') === 'gasto'),
    [categories],
  );

  // Categoría seleccionada: la del parámetro, o la primera con límite, o 'food'.
  const initialCategoryId = useMemo(() => {
    if (typeof categoria === 'string' && categories.some((c) => c.id === categoria)) {
      return categoria;
    }
    const withLimit = Object.keys(resolveMonthLimits(limitsByMonth, monthKey));
    return expenseCategories.find((c) => withLimit.includes(c.id))?.id ?? expenseCategories[0]?.id ?? 'food';
  }, [categoria, monthKey, limitsByMonth, expenseCategories, categories]);

  const [selectedId, setSelectedId] = useState<string>(initialCategoryId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [periodPickerOpen, setPeriodPickerOpen] = useState(false);

  const limits = resolveMonthLimits(limitsByMonth, monthKey);
  const currentLimit = limits[selectedId];

  const [amountRaw, setAmountRaw] = useState<string>(() =>
    currentLimit != null ? String(currentLimit.amount) : '',
  );
  const [notify80, setNotify80] = useState<boolean>(() => currentLimit?.notify80 !== false);

  // Ajuste derivado durante el render: al navegar con otra categoría por
  // parámetro, se adopta (sin efectos). Una vez dentro, el usuario puede
  // elegir cualquier categoría desde el selector.
  const [prevCategoriaParam, setPrevCategoriaParam] = useState(categoria ?? null);
  if ((categoria ?? null) !== prevCategoriaParam) {
    setPrevCategoriaParam(categoria ?? null);
    if (typeof categoria === 'string' && categories.some((c) => c.id === categoria)) {
      setSelectedId(categoria);
    }
  }

  // Ajuste derivado durante el render: al cambiar de categoría o de mes se
  // recargan el monto y la alerta desde los límites guardados (sin efectos).
  const combo = `${selectedId}|${monthKey}`;
  const [prevCombo, setPrevCombo] = useState(combo);
  if (combo !== prevCombo) {
    setPrevCombo(combo);
    const entry = resolveMonthLimits(limitsByMonth, monthKey)[selectedId];
    setAmountRaw(entry != null ? String(entry.amount) : '');
    setNotify80(entry?.notify80 !== false);
  }

  const amountValue = parseAmount(amountRaw);
  const amountError = amountRaw.trim() !== '' && amountValue === null;
  const selectedCategory = categories.find((category) => category.id === selectedId);

  const categoryOptions = useMemo(
    () =>
      expenseCategories.map((category) => ({
        value: category.id,
        label: category.name,
        icon: category.icon,
      })),
    [expenseCategories],
  );

  const months = useMemo(() => {
    const now = new Date();
    const list: string[] = [];
    for (let i = 0; i < 12; i += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      list.push(key);
    }
    return list;
  }, []);

  const handleSave = () => {
    const value = amountValue;
    if (value === null || value <= 0) {
      return;
    }
    setMonthLimit(monthKey, selectedId, { amount: value, notify80 });
    router.back();
  };

  return (
    <Screen scroll keyboardAware>
      <Header title="Editar límite" />

      <View style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          Un límite{'\n'}que te cuide.
        </AppText>

        <SelectRow
          label="Categoría"
          value={selectedCategory?.name ?? 'Elegir…'}
          onPress={() => setPickerOpen(true)}
          accessibilityLabel={`Categoría: ${selectedCategory?.name ?? 'elegí'}`}
        />

        <FieldRow label="Presupuesto mensual" error={amountError ? 'Ingresá un monto válido' : null}>
          <View
            style={[
              styles.amountField,
              {
                backgroundColor: palette.card,
                borderColor: amountError ? palette.danger : palette.border,
              },
            ]}
          >
            <AppText variant="subtitle" weight="800" tone="secondary">
              $
            </AppText>
            <TextInput
              testID="limit-amount-input"
              value={amountRaw}
              onChangeText={(text) => setAmountRaw(sanitizeAmountInput(text))}
              keyboardType="decimal-pad"
              placeholder="300.000"
              placeholderTextColor={palette.textTertiary}
              returnKeyType="done"
              accessibilityLabel="Presupuesto mensual"
              style={[styles.amountInput, { color: palette.textPrimary }]}
            />
          </View>
        </FieldRow>

        <FieldRow label="Período">
          <PressableScale
            onPress={() => setPeriodPickerOpen(true)}
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel={`Período: ${formatMonthLabel(monthKey)}`}
            style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <AppText variant="body" weight="500">
              {formatMonthLabel(monthKey)}
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
          </PressableScale>
        </FieldRow>

        <View style={[styles.toggleCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.toggleText}>
            <View style={styles.toggleTitleRow}>
              <Ionicons name="notifications-outline" size={22} color={palette.primary} />
              <AppText variant="body" weight="700" style={styles.toggleTitle}>
                Avisarme al llegar al 80%
              </AppText>
            </View>
            <AppText variant="caption" tone="tertiary">
              Antes de alcanzar el límite mensual.
            </AppText>
          </View>
          <Switch
            value={notify80}
            onValueChange={setNotify80}
            trackColor={{ false: '#2C2C2C', true: palette.primary }}
            thumbColor={notify80 ? '#FFFFFF' : '#8A8A8A'}
            accessibilityLabel="Avisarme al llegar al 80%"
          />
        </View>

        <Button
          label="Guardar límite"
          onPress={handleSave}
          disabled={amountValue === null || amountValue <= 0}
          style={styles.submitButton}
        />
        <Button
          label="Cancelar"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>

      <SelectSheet
        visible={pickerOpen}
        title="Categoría"
        options={categoryOptions}
        selectedValue={selectedId}
        onSelect={setSelectedId}
        onClose={() => setPickerOpen(false)}
      />

      <SelectSheet
        visible={periodPickerOpen}
        title="Período"
        options={months.map((key) => ({ value: key, label: formatMonthLabel(key) }))}
        selectedValue={monthKey}
        onSelect={setMonthKey}
        onClose={() => setPeriodPickerOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  headline: {
    fontSize: 28,
    lineHeight: 33,
  },
  amountField: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    paddingVertical: 12,
    padding: 0,
  },
  row: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  toggleText: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleTitle: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.xs,
    minHeight: 54,
  },
});
