import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { SelectSheet } from '@/components/SelectSheet';
import { FieldRow } from '@/components/FieldRow';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { PAYMENT_METHODS } from '@/constants/finance';
import { radius, spacing } from '@/constants/layout';
import { useMovementFilterStore } from '@/store/useMovementFilterStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';

type Sheet = 'tipo' | 'periodo' | 'categoria' | 'medio' | 'orden' | null;

export default function FiltrosScreen() {
  const { palette } = useAppTheme();
  const router = useRouter();

  const monthKey = useMonthStore((state) => state.monthKey);
  const categories = useFinanceStore((state) => state.categories);
  const filter = useMovementFilterStore();

  const [sheet, setSheet] = useState<Sheet>(null);

  const tipoLabel = { todos: 'Todos', ingresos: 'Ingresos', gastos: 'Gastos' }[filter.tipo];
  const periodLabel =
    filter.period === 'mes'
      ? periodRangeLabel(monthKey)
      : `Todo ${monthKey.slice(0, 4)}`;
  const categoryLabel =
    filter.categoryId === null
      ? 'Todas las categorías'
      : categories.find((category) => category.id === filter.categoryId)?.name ?? 'Categoría';
  const paymentLabel =
    filter.paymentMethod === null
      ? 'Todos los medios'
      : PAYMENT_METHODS.find((method) => method.id === filter.paymentMethod)?.label ?? 'Medio';
  const sortLabel = {
    recientes: 'Más recientes primero',
    antiguos: 'Más antiguos primero',
    monto: 'Mayor monto primero',
  }[filter.sort];

  const rows: { key: Sheet & string; label: string; value: string }[] = [
    { key: 'tipo', label: 'Tipo de movimiento', value: tipoLabel },
    { key: 'periodo', label: 'Período', value: periodLabel },
    { key: 'categoria', label: 'Categoría', value: categoryLabel },
    { key: 'medio', label: 'Medio de pago', value: paymentLabel },
    { key: 'orden', label: 'Ordenar por', value: sortLabel },
  ];

  const applyAndBack = () => {
    router.back();
  };

  const clearAndBack = () => {
    filter.resetFilter();
    router.back();
  };

  return (
    <Screen scroll keyboardAware>
      <Header title="Filtros" />

      <View style={styles.content}>
        <AppText variant="title" weight="800" style={styles.headline}>
          Encontrá{'\n'}lo que buscás.
        </AppText>

        {rows.map((row) => (
          <FieldRow key={row.key} label={row.label}>
            <PressableScale
              onPress={() => setSheet(row.key)}
              scaleTo={0.98}
              accessibilityRole="button"
              accessibilityLabel={`${row.label}: ${row.value}`}
              style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <AppText variant="body" weight="500" numberOfLines={1} style={styles.rowValue}>
                {row.value}
              </AppText>
              <AppText variant="body" tone="tertiary">
                ›
              </AppText>
            </PressableScale>
          </FieldRow>
        ))}

        <Button
          label="Aplicar filtros"
          onPress={applyAndBack}
          style={styles.submitButton}
        />
        <Button
          label="Limpiar filtros"
          variant="secondary"
          onPress={clearAndBack}
        />
      </View>

      {/* Tipo */}
      <SelectSheet
        visible={sheet === 'tipo'}
        title="Tipo de movimiento"
        options={[
          { value: 'todos', label: 'Todos', icon: 'format-list-bulleted' },
          { value: 'gastos', label: 'Gastos', icon: 'cart-outline' },
          { value: 'ingresos', label: 'Ingresos', icon: 'bank-outline' },
        ]}
        selectedValue={filter.tipo}
        onSelect={(value) => filter.setFilter({ tipo: value as typeof filter.tipo })}
        onClose={() => setSheet(null)}
      />

      {/* Período */}
      <SelectSheet
        visible={sheet === 'periodo'}
        title="Período"
        options={[
          { value: 'mes', label: periodRangeLabel(monthKey), description: 'El mes que estás viendo' },
          { value: 'anio', label: `Todo ${monthKey.slice(0, 4)}`, description: 'Todos los movimientos del año' },
        ]}
        selectedValue={filter.period}
        onSelect={(value) => filter.setFilter({ period: value as typeof filter.period })}
        onClose={() => setSheet(null)}
      />

      {/* Categoría */}
      <SelectSheet
        visible={sheet === 'categoria'}
        title="Categoría"
        options={[
          { value: 'all', label: 'Todas las categorías' },
          ...categories
            .filter((category) => (category.type ?? 'gasto') === 'gasto')
            .map((category) => ({ value: category.id, label: category.name, icon: category.icon })),
        ]}
        selectedValue={filter.categoryId ?? 'all'}
        onSelect={(value) => filter.setFilter({ categoryId: value === 'all' ? null : value })}
        onClose={() => setSheet(null)}
      />

      {/* Medio de pago */}
      <SelectSheet
        visible={sheet === 'medio'}
        title="Medio de pago"
        options={[
          { value: 'all', label: 'Todos los medios' },
          ...PAYMENT_METHODS.map((method) => ({ value: method.id as string, label: method.label, icon: method.icon })),
        ]}
        selectedValue={filter.paymentMethod ?? 'all'}
        onSelect={(value) => filter.setFilter({ paymentMethod: value === 'all' ? null : value })}
        onClose={() => setSheet(null)}
      />

      {/* Ordenar */}
      <SelectSheet
        visible={sheet === 'orden'}
        title="Ordenar por"
        options={[
          { value: 'recientes', label: 'Más recientes primero' },
          { value: 'antiguos', label: 'Más antiguos primero' },
          { value: 'monto', label: 'Mayor monto primero' },
        ]}
        selectedValue={filter.sort}
        onSelect={(value) => filter.setFilter({ sort: value as typeof filter.sort })}
        onClose={() => setSheet(null)}
      />
    </Screen>
  );
}

function periodRangeLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;
  const endDay = isCurrentMonth ? now.getDate() : new Date(year, month, 0).getDate();
  return `1 al ${endDay} de ${monthNames[month - 1]} ${year}`;
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  headline: {
    fontSize: 30,
    lineHeight: 36,
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
});
