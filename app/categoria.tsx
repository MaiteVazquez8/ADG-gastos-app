import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { getCategoryColors, getCategoryIcons } from '@/constants/finance';
import { radius, spacing } from '@/constants/layout';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import type { IconName } from '@/types';
import { alpha } from '@/utils/color';
import { addCategoryToDistribution, resolveMonthDistribution } from '@/utils/budget';
import { MAX_CATEGORY_NAME_LENGTH, parsePercentageInput, sanitizePercentageInput, validateCategoryName } from '@/utils/validation';

export default function CategoriaScreen() {
  const router = useRouter();
  const { editId, distribucion } = useLocalSearchParams<{ editId?: string; distribucion?: string }>();
  const { palette, isDark } = useAppTheme();

  const monthKey = useMonthStore((state) => state.monthKey);
  const categories = useFinanceStore((state) => state.categories);
  const distributionsByMonth = useFinanceStore((state) => state.distributionsByMonth);
  const defaultDistribution = useFinanceStore((state) => state.defaultDistribution);
  const addCategory = useFinanceStore((state) => state.addCategory);
  const updateCategory = useFinanceStore((state) => state.updateCategory);
  const setMonthDistributions = useFinanceStore((state) => state.setMonthDistributions);

  const isEdit = typeof editId === 'string' && editId.length > 0;
  const withDistribution = typeof distribucion === 'string';
  const existing = useMemo(
    () => (isEdit ? categories.find((c) => c.id === editId) : undefined),
    [categories, editId, isEdit],
  );

  const colors = getCategoryColors();
  const icons = getCategoryIcons();

  const [name, setName] = useState<string>(existing?.name ?? '');
  const [color, setColor] = useState<string>(existing?.color ?? colors[0]);
  const [icon, setIcon] = useState<IconName>(existing?.icon ?? icons[0]);
  const [percentRaw, setPercentRaw] = useState<string>('0');
  const [nameError, setNameError] = useState<string | null>(null);

  if (isEdit && !existing) {
    return (
      <Screen scroll>
        <Header title="Editar categoría" showBack />
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
  const canSave = nameErrorText === null && (!withDistribution || percent !== null);

  const handleSave = () => {
    if (!canSave) {
      return;
    }
    const cleanName = name.trim();
    if (isEdit && existing) {
      updateCategory(existing.id, { name: cleanName, icon, color });
      router.back();
      return;
    }
    const category = addCategory({ name: cleanName, icon, color });
    if (withDistribution && percent !== null) {
      const base = resolveMonthDistribution(distributionsByMonth, defaultDistribution, monthKey);
      setMonthDistributions(monthKey, addCategoryToDistribution(base, category.id, percent));
    }
    router.back();
  };

  return (
    <Screen scroll keyboardAware>
      <Header title={isEdit ? 'Editar categoría' : 'Nueva categoría'} showBack />

      <View style={styles.content}>
        <TextField
          label="Nombre"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setNameError(null);
          }}
          placeholder="Ej: Deudas"
          maxLength={MAX_CATEGORY_NAME_LENGTH}
          error={nameErrorText ?? undefined}
        />

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
                    selected && [styles.swatchSelected, { borderColor: palette.card }],
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View>
          <AppText variant="label" tone="secondary" style={styles.marginBottom}>
            Ícono
          </AppText>
          <View style={styles.iconGrid} accessibilityRole="radiogroup" accessibilityLabel="Ícono">
            {icons.map((iconName) => {
              const selected = icon === iconName;
              return (
                <PressableScale
                  key={iconName}
                  onPress={() => setIcon(iconName)}
                  scaleTo={0.92}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={iconName}
                  style={[
                    styles.iconItem,
                    { backgroundColor: selected ? alpha(color, isDark ? 0.3 : 0.16) : palette.cardPressed },
                    selected && { borderWidth: 2, borderColor: color },
                  ]}
                >
                  <MaterialCommunityIcons name={iconName} size={22} color={selected ? color : palette.textSecondary} />
                </PressableScale>
              );
            })}
          </View>
        </View>

        {withDistribution && !isEdit ? (
          <AppText variant="caption" tone="tertiary">
            La categoría se agrega a la distribución del mes actual con ese porcentaje.
          </AppText>
        ) : null}

        <Button
          label={isEdit ? 'Guardar cambios' : 'Crear categoría'}
          onPress={handleSave}
          disabled={!canSave}
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
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconItem: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});