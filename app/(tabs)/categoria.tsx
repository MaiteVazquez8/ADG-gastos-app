import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, StyleSheet, TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { SelectSheet } from '@/components/SelectSheet';
import { TextField } from '@/components/TextField';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { getCategoryColors, getCategoryIcons } from '@/constants/finance';
import { radius, spacing } from '@/constants/layout';
import { useBudgetStore, resolveMonthLimits } from '@/store/useBudgetStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import type { IconName } from '@/types';
import { addCategoryToDistribution, resolveMonthDistribution } from '@/utils/budget';
import { countExpensesByCategory } from '@/utils/categories';
import { parseAmount, sanitizeAmountInput } from '@/utils/currency';
import { formatMonthLabel } from '@/utils/date';
import {
  MAX_CATEGORY_NAME_LENGTH,
  parsePercentageInput,
  sanitizePercentageInput,
  validateCategoryName,
} from '@/utils/validation';

const FEATURED_ICONS: IconName[] = [
  'cart-outline',
  'home',
  'bank-outline',
  'credit-card-outline',
  'tag-outline',
  'dots-horizontal-circle-outline',
];

export default function CategoriaScreen() {
  const router = useRouter();
  const { editId, distribucion, tipo } = useLocalSearchParams<{ editId?: string; distribucion?: string; tipo?: string }>();
  const { palette } = useAppTheme();

  const monthKey = useMonthStore((state) => state.monthKey);
  const categories = useFinanceStore((state) => state.categories);
  const distributionsByMonth = useFinanceStore((state) => state.distributionsByMonth);
  const defaultDistribution = useFinanceStore((state) => state.defaultDistribution);
  const addCategory = useFinanceStore((state) => state.addCategory);
  const updateCategory = useFinanceStore((state) => state.updateCategory);
  const deleteCategory = useFinanceStore((state) => state.deleteCategory);
  const setMonthDistributions = useFinanceStore((state) => state.setMonthDistributions);
  const expenses = useExpenseStore((state) => state.expenses);
  const moveExpensesByCategory = useExpenseStore((state) => state.moveExpensesByCategory);

  const limitsByMonth = useBudgetStore((state) => state.limitsByMonth);
  const setMonthLimit = useBudgetStore((state) => state.setMonthLimit);
  const removeMonthLimit = useBudgetStore((state) => state.removeMonthLimit);

  const isEdit = typeof editId === 'string' && editId.length > 0;
  const withDistribution = typeof distribucion === 'string';
  const existing = useMemo(
    () => (isEdit ? categories.find((c) => c.id === editId) : undefined),
    [categories, editId, isEdit],
  );

  const currentLimit = existing?.id
    ? limitsByMonth[monthKey]?.[existing.id]?.amount
    : resolveMonthLimits(limitsByMonth, monthKey)[existing?.id ?? '']?.amount;

  const colors = getCategoryColors();
  const icons = getCategoryIcons();
  const initialIconList = [...FEATURED_ICONS, ...icons.filter((icon) => !FEATURED_ICONS.includes(icon))];

  const [name, setName] = useState<string>(existing?.name ?? '');
  const [icon, setIcon] = useState<IconName>(existing?.icon ?? 'cart-outline');
  const [color, setColor] = useState<string>(existing?.color ?? colors[0]);
  const [kind, setKind] = useState<'gasto' | 'ingreso'>(
    () => existing?.type ?? (tipo === 'ingreso' ? 'ingreso' : 'gasto'),
  );
  const [percentRaw, setPercentRaw] = useState<string>('0');
  const [budgetRaw, setBudgetRaw] = useState<string>(() =>
    currentLimit != null ? String(currentLimit) : '',
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);

  if (isEdit && !existing) {
    return (
      <Screen scroll>
        <Header title="Editar categoría" />
        <EmptyState
          icon="help-circle-outline"
          title="Categoría no encontrada"
          message="La categoría que querés editar ya no existe."
          action={<Button label="Volver" variant="secondary" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  const percent = parsePercentageInput(percentRaw);
  const nameErrorText = nameError ?? validateCategoryName(name);
  const budgetValue = budgetRaw.trim() === '' ? null : parseAmount(budgetRaw);
  const budgetError = budgetRaw.trim() !== '' && budgetValue === null;
  const canSave = nameErrorText === null && budgetError === false && (!withDistribution || percent !== null);

  const expenseCount = existing ? countExpensesByCategory(expenses, existing.id) : 0;

  const handleSave = () => {
    if (!canSave) {
      return;
    }
    const cleanName = name.trim();

    if (isEdit && existing) {
      updateCategory(existing.id, { name: cleanName, icon, color, type: kind });
      if (kind === 'gasto') {
        if (budgetRaw.trim() === '') {
          removeMonthLimit(monthKey, existing.id);
        } else if (budgetValue !== null) {
          setMonthLimit(monthKey, existing.id, { amount: budgetValue, notify80: true });
        }
      }
      router.back();
      return;
    }

    const category = addCategory({ name: cleanName, icon, color, type: kind });
    if (kind === 'gasto' && budgetValue !== null) {
      setMonthLimit(monthKey, category.id, { amount: budgetValue, notify80: true });
    }
    if (withDistribution && percent !== null) {
      const base = resolveMonthDistribution(distributionsByMonth, defaultDistribution, monthKey);
      setMonthDistributions(monthKey, addCategoryToDistribution(base, category.id, percent));
    }
    router.back();
  };

  const confirmDelete = () => {
    if (!existing) {
      return;
    }
    setPendingDelete(true);
  };

  const resolveDelete = (targetId: string | null) => {
    if (!existing) {
      return;
    }
    if (targetId !== null) {
      moveExpensesByCategory(existing.id, targetId);
    }
    deleteCategory(existing.id);
    setPendingDelete(false);
    router.back();
  };

  const otherCategories = categories.filter((c) => c.id !== existing?.id);

  return (
    <Screen scroll keyboardAware>
      <Header title={isEdit ? 'Editar categoría' : 'Nueva categoría'} />

      <View style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          Cada categoría,{'\n'}a tu medida.
        </AppText>

        <TextField
          label="Nombre"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setNameError(null);
          }}
          placeholder="Ej: Alimentación"
          maxLength={MAX_CATEGORY_NAME_LENGTH}
          error={nameErrorText ?? undefined}
        />

        <PressableScale
          onPress={() => setTypeSheetOpen(true)}
          scaleTo={0.98}
          accessibilityRole="button"
          accessibilityLabel={`Tipo de movimiento: ${kind === 'gasto' ? 'Gasto' : 'Ingreso'}`}
          style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
        >
          <View>
            <AppText variant="caption" tone="secondary">Tipo de movimiento</AppText>
            <AppText variant="body" weight="600">{kind === 'gasto' ? 'Gasto' : 'Ingreso'}</AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
        </PressableScale>

        <View>
          <AppText variant="label" tone="secondary" style={styles.marginBottom}>
            Elegí un icono
          </AppText>
          <View style={styles.iconRow} accessibilityRole="radiogroup" accessibilityLabel="Icono">
            {initialIconList.slice(0, 6).map((iconName) => {
              const selected = icon === iconName;
              return (
                <PressableScale
                  key={iconName}
                  onPress={() => setIcon(iconName)}
                  scaleTo={0.9}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={iconName}
                  style={[
                    styles.iconItem,
                    { backgroundColor: selected ? palette.primary : palette.cardPressed },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={iconName}
                    size={22}
                    color={selected ? palette.onPrimary : palette.textSecondary}
                  />
                </PressableScale>
              );
            })}
          </View>
        </View>

        {kind === 'gasto' ? (
          <View>
            <AppText variant="label" tone="secondary" style={styles.marginBottom}>
              Presupuesto mensual (opcional)
            </AppText>
            <View
              style={[
                styles.budgetField,
                {
                  backgroundColor: palette.card,
                  borderColor: budgetError ? palette.danger : palette.border,
                },
              ]}
            >
              <AppText variant="subtitle" weight="700" tone="secondary">
                $
              </AppText>
              <TextInput
                value={budgetRaw}
                onChangeText={(text) => setBudgetRaw(sanitizeAmountInput(text))}
                placeholder="300.000"
                placeholderTextColor={palette.textTertiary}
                keyboardType="decimal-pad"
                accessibilityLabel="Presupuesto mensual"
                style={[styles.budgetInput, { color: palette.textPrimary }]}
              />
            </View>
            {budgetError ? (
              <AppText variant="caption" tone="danger" style={styles.errorTop}>
                Ingresá un monto válido o dejalo vacío.
              </AppText>
            ) : (
              <AppText variant="caption" tone="tertiary" style={styles.errorTop}>
                Límite mensual para {formatMonthLabel(monthKey)}. Vacío = sin límite.
              </AppText>
            )}
          </View>
        ) : null}

        {withDistribution && !isEdit ? (
          <TextField
            label="Porcentaje del mes"
            value={percentRaw}
            onChangeText={(text) => setPercentRaw(sanitizePercentageInput(text))}
            keyboardType="decimal-pad"
            placeholder="0"
            error={percent === null ? 'Porcentaje inválido (0-100)' : undefined}
            suffix={<AppText variant="body" tone="secondary">%</AppText>}
          />
        ) : null}

        <View>
          <AppText variant="label" tone="secondary" style={styles.marginBottom}>
            Color
          </AppText>
          <View style={styles.swatchRow} accessibilityRole="radiogroup" accessibilityLabel="Color">
            {colors.map((swatch) => {
              const selected = color === swatch;
              return (
                <PressableScale
                  key={swatch}
                  onPress={() => setColor(swatch)}
                  scaleTo={0.85}
                  pressedOpacity={0.85}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Color ${swatch}`}
                  style={[
                    styles.swatch,
                    { backgroundColor: swatch },
                    selected && { borderWidth: 2, borderColor: palette.primary },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <Button
          label={isEdit ? 'Guardar cambios' : 'Guardar categoría'}
          onPress={handleSave}
          disabled={!canSave}
          style={styles.submitButton}
        />
        <Button
          label="Cancelar"
          variant="secondary"
          onPress={() => router.back()}
        />
        {isEdit ? (
          <PressableScale
            onPress={confirmDelete}
            accessibilityRole="button"
            accessibilityLabel="Eliminar categoría"
            style={styles.deleteButton}
          >
            <AppText variant="label" tone="danger" weight="600">
              Eliminar categoría
            </AppText>
          </PressableScale>
        ) : null}
      </View>

      <SelectSheet
        visible={typeSheetOpen}
        title="Tipo de movimiento"
        options={[
          { value: 'gasto', label: 'Gasto', icon: 'cart-outline', description: 'Podés asignarle un presupuesto mensual' },
          { value: 'ingreso', label: 'Ingreso', icon: 'bank-outline', description: 'Fuente de dinero que entra' },
        ]}
        selectedValue={kind}
        onSelect={(value) => setKind(value === 'ingreso' ? 'ingreso' : 'gasto')}
        onClose={() => setTypeSheetOpen(false)}
      />

      {/* Modal para reasignar gastos al eliminar */}
      <Modal
        visible={pendingDelete}
        transparent
        animationType="slide"
        onRequestClose={() => setPendingDelete(false)}
      >
        <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
          <PressableScale
            style={styles.modalBackdrop}
            onPress={() => setPendingDelete(false)}
            scaleTo={1}
            pressedOpacity={1}
            accessibilityLabel="Cerrar"
          />
          <View style={[styles.sheet, { backgroundColor: palette.card }]}>
            <AppText variant="subtitle">
              {existing ? `Eliminar "${existing.name}"` : 'Eliminar categoría'}
            </AppText>
            <AppText variant="body" tone="secondary">
              {expenseCount} {expenseCount === 1 ? 'gasto usa' : 'gastos usan'} esta categoría. ¿Qué hacés con esos gastos?
            </AppText>
            <View style={styles.moveOptions}>
              {otherCategories.map((category) => (
                <Button
                  key={category.id}
                  label={`Mover gastos a ${category.name}`}
                  variant="secondary"
                  size="sm"
                  onPress={() => resolveDelete(category.id)}
                />
              ))}
              <Button
                label="Dejar gastos sin categoría"
                variant="secondary"
                size="sm"
                onPress={() => resolveDelete(null)}
              />
              <Button
                label="Cancelar"
                variant="ghost"
                size="sm"
                onPress={() => setPendingDelete(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  marginBottom: {
    marginBottom: spacing.xs,
  },
  errorTop: {
    marginTop: spacing.xs,
  },
  row: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  iconItem: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    minHeight: 56,
  },
  budgetInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 12,
    padding: 0,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  submitButton: {
    marginTop: spacing.xs,
    minHeight: 54,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
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
    gap: spacing.md,
  },
  moveOptions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
