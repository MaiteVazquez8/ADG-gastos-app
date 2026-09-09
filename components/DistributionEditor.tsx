import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ProgressBar } from '@/components/ProgressBar';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { fontSize, radius, shadows, spacing } from '@/constants/layout';
import type { CategoryDistribution, FinanceCategory } from '@/types';
import { allocatedForCategory, amountToPercentage, distributionEditorValues } from '@/utils/budget';
import { alpha } from '@/utils/color';
import { formatCurrency, parseAmount, sanitizeAmountInput } from '@/utils/currency';
import { parsePercentageInput, sanitizePercentageInput } from '@/utils/validation';

type EntryMode = 'percent' | 'amount';

interface DistributionEditorProps {
  categories: readonly FinanceCategory[];
  incomeTotal: number;
  /** Effective distribution values (explicit for the month, or the default). */
  distributions: readonly CategoryDistribution[];
  saveLabel: string;
  onSave: (distributions: CategoryDistribution[]) => void;
  /** Replaces the default caption (e.g. for the default distribution screen). */
  incomeNote?: string;
  /** Extra button rendered below the save button, e.g. "Nueva categoría". */
  extraAction?: ReactNode;
}

function ModeToggle({
  value,
  onChange,
}: {
  value: EntryMode;
  onChange: (mode: EntryMode) => void;
}) {
  const { palette } = useAppTheme();
  const option = (mode: EntryMode, label: string) => {
    const active = value === mode;
    return (
      <Pressable
        key={mode}
        onPress={() => onChange(mode)}
        accessibilityRole="radio"
        accessibilityState={{ selected: active }}
        accessibilityLabel={mode === 'percent' ? 'Porcentaje' : 'Monto fijo'}
        style={[
          styles.modeOption,
          { backgroundColor: active ? palette.primary : 'transparent' },
        ]}
      >
        <AppText
          variant="label"
          weight="700"
          style={{ color: active ? palette.onPrimary : palette.textSecondary }}
        >
          {label}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View
      style={[styles.modeToggle, { backgroundColor: palette.track, borderColor: palette.border }]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Modo de entrada"
    >
      {option('percent', '%')}
      {option('amount', '$')}
    </View>
  );
}

const EPSILON = 1e-6;

export function DistributionEditor({
  categories,
  incomeTotal,
  distributions,
  saveLabel,
  onSave,
  incomeNote,
  extraAction,
}: DistributionEditorProps) {
  const { palette, isDark } = useAppTheme();

  // Seeds reflect the current categories + distributions on every render, so
  // rows added while the editor is open (e.g. a new category created from the
  // same flow) get a value instead of an undefined key. User edits always win.
  const seededValues = useMemo(
    () => distributionEditorValues(categories, distributions),
    [categories, distributions],
  );

  const [rawById, setRawById] = useState<Record<string, string>>(() =>
    distributionEditorValues(categories, distributions),
  );
  const [amountRawById, setAmountRawById] = useState<Record<string, string>>({});
  const [modeById, setModeById] = useState<Record<string, EntryMode>>({});

  const valuesById = useMemo(() => ({ ...seededValues, ...rawById }), [seededValues, rawById]);

  const canUseAmounts = incomeTotal > 0;

  const entries = categories.map((category) => {
    // Without income a fixed amount means nothing, so the editor always works
    // in percentages regardless of any previously selected mode.
    const storedMode = modeById[category.id] ?? 'percent';
    const mode = canUseAmounts ? storedMode : 'percent';
    let percentage: number | null = null;
    if (mode === 'percent') {
      percentage = parsePercentageInput(valuesById[category.id]);
    } else {
      const amount = parseAmount(amountRawById[category.id] ?? '');
      percentage = amount === null ? null : amountToPercentage(amount, incomeTotal);
    }
    return { category, percentage, mode };
  });

  const allValid = entries.every((entry) => entry.percentage !== null);
  const sum = allValid
    ? Math.round(entries.reduce((acc, entry) => acc + (entry.percentage ?? 0), 0) * 100) / 100
    : 0;
  const remaining = Math.round((100 - sum) * 100) / 100;
  const saveEnabled = allValid && Math.abs(remaining) <= EPSILON;

  const hasInvalidAmount = entries.some(
    (entry) =>
      entry.mode === 'amount' &&
      entry.percentage === null &&
      (amountRawById[entry.category.id] ?? '').trim() !== '',
  );
  const hasEmptyAmount = entries.some(
    (entry) =>
      entry.mode === 'amount' &&
      entry.percentage === null &&
      (amountRawById[entry.category.id] ?? '').trim() === '',
  );

  const handlePercentChange = (categoryId: string, raw: string) => {
    setRawById((current) => ({ ...current, [categoryId]: sanitizePercentageInput(raw) }));
  };

  const handleAmountChange = (categoryId: string, raw: string) => {
    setAmountRawById((current) => ({ ...current, [categoryId]: sanitizeAmountInput(raw) }));
  };

  const handleSwitchMode = (categoryId: string, next: EntryMode) => {
    if ((modeById[categoryId] ?? 'percent') === next) {
      return;
    }
    setModeById((current) => ({ ...current, [categoryId]: next }));
    if (next === 'amount') {
      // Always re-derive the amount from the CURRENT percentage so a stale
      // amount never silently overrides a percentage edited meanwhile.
      const percent = parsePercentageInput(valuesById[categoryId]);
      setAmountRawById((current) => ({
        ...current,
        [categoryId]:
          percent === null ? (current[categoryId] ?? '') : String(allocatedForCategory(percent, incomeTotal)),
      }));
    } else {
      // Back to percent: keep the percentage derived from the typed amount.
      const amount = parseAmount(amountRawById[categoryId] ?? '');
      const derived = amount === null ? null : amountToPercentage(amount, incomeTotal);
      setRawById((current) => ({
        ...current,
        [categoryId]: derived === null ? (current[categoryId] ?? '') : String(derived),
      }));
    }
  };

  const handleSave = () => {
    if (!saveEnabled) {
      return;
    }
    const next: CategoryDistribution[] = entries.map((entry) => ({
      categoryId: entry.category.id,
      percentage: entry.percentage ?? 0,
    }));
    onSave(next);
  };

  return (
    <View style={styles.container}>
      {categories.length === 0 ? (
        <EmptyState
          icon="albums-outline"
          title="Todavía no hay categorías"
          message="Sin categorías no hay nada que distribuir. Creá al menos una para armar tu distribución."
          action={extraAction ? <View style={styles.emptyAction}>{extraAction}</View> : undefined}
        />
      ) : (
        <>
          <View style={styles.headerText}>
            <AppText variant="caption" tone="secondary">
              {incomeNote ??
                (incomeTotal > 0
                  ? `Total a distribuir: ${formatCurrency(incomeTotal)}`
                  : 'Sin ingresos en este mes: la distribución queda guardada igual.')}
            </AppText>
            {canUseAmounts ? (
              <AppText variant="caption" tone="tertiary">
                Cada categoría puede definirse por porcentaje o por un monto fijo: el % se calcula solo.
              </AppText>
            ) : null}
          </View>

          <View style={styles.list}>
            {entries.map(({ category, percentage, mode }) => {
              const inputValue =
                mode === 'percent' ? valuesById[category.id] : (amountRawById[category.id] ?? '');
              const unit = mode === 'percent' ? '%' : '$';
              const inAmountMode = mode === 'amount';
              const amount = inAmountMode ? parseAmount(amountRawById[category.id] ?? '') : null;
              const caption = inAmountMode
                ? percentage !== null
                  ? `${percentage}% del ingreso`
                  : amount !== null
                    ? 'Supera el ingreso del mes'
                    : '—'
                : percentage !== null
                  ? formatCurrency(allocatedForCategory(percentage, incomeTotal))
                  : '—';

              return (
                <View
                  key={category.id}
                  style={[
                    styles.row,
                    shadows.card,
                    { backgroundColor: palette.card, borderColor: palette.border },
                  ]}
                >
                  <View
                    style={[
                      styles.icon,
                      { backgroundColor: alpha(category.color, isDark ? 0.25 : 0.14) },
                    ]}
                  >
                    <MaterialCommunityIcons name={category.icon} size={20} color={category.color} />
                  </View>

                  <View style={styles.rowText}>
                    <AppText variant="body" weight="600" numberOfLines={1}>
                      {category.name}
                    </AppText>
                    <AppText
                      variant="caption"
                      tone={percentage === null ? 'danger' : 'tertiary'}
                      numberOfLines={1}
                    >
                      {caption}
                    </AppText>
                  </View>

                  {canUseAmounts ? (
                    <ModeToggle value={mode} onChange={(next) => handleSwitchMode(category.id, next)} />
                  ) : null}

                  <View
                    style={[
                      styles.inputWrap,
                      {
                        backgroundColor: palette.cardPressed,
                        borderColor: percentage === null ? palette.danger : palette.border,
                      },
                    ]}
                  >
                    <TextInput
                      value={inputValue}
                      onChangeText={(raw) =>
                        inAmountMode
                          ? handleAmountChange(category.id, raw)
                          : handlePercentChange(category.id, raw)
                      }
                      keyboardType="decimal-pad"
                      accessibilityLabel={
                        inAmountMode ? `Monto de ${category.name}` : `Porcentaje de ${category.name}`
                      }
                      style={[styles.input, { color: palette.textPrimary }]}
                    />
                    <AppText variant="body" tone={inAmountMode ? 'accent' : 'secondary'}>
                      {unit}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.summaryCard}>
            {!allValid ? (
              <AppText variant="body" tone="danger">
                {hasInvalidAmount
                  ? 'Revisá los montos: tienen que ser mayores a $0 y no superar el ingreso del mes.'
                  : hasEmptyAmount
                    ? 'Completá todos los montos.'
                    : 'Completá todos los porcentajes.'}
              </AppText>
            ) : remaining >= 0 ? (
              <View style={styles.summaryTextRow}>
                <AppText variant="body" weight="600" tabular>
                  Distribuido: {sum}%
                </AppText>
                <AppText variant="body" tone={saveEnabled ? 'accent' : 'secondary'} tabular>
                  Falta asignar: {remaining}%
                </AppText>
              </View>
            ) : (
              <View style={styles.summaryTextRow}>
                <AppText variant="body" weight="600" tabular>
                  Distribuido: {sum}%
                </AppText>
                <AppText variant="body" tone="danger" tabular>
                  Excede: {-remaining}%
                </AppText>
              </View>
            )}
            {allValid ? (
              <View style={styles.progressWrap}>
                <ProgressBar
                  progress={Math.min(sum, 100)}
                  color={saveEnabled ? palette.success : Math.abs(remaining) <= 0.05 ? palette.success : palette.warning}
                />
              </View>
            ) : null}
          </View>

          <Button label={saveLabel} onPress={handleSave} disabled={!saveEnabled} />
          {extraAction}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  emptyAction: {
    alignSelf: 'stretch',
  },
  headerText: {
    gap: spacing.xs,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
    minWidth: 80,
    justifyContent: 'center',
  },
  input: {
    fontSize: fontSize.md,
    fontWeight: '700',
    padding: 0,
    minWidth: 40,
    textAlign: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    padding: 2,
    gap: 2,
  },
  modeOption: {
    minWidth: 36,
    height: 30,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  summaryTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  progressWrap: {
    marginTop: spacing.xs,
  },
});