import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, StyleSheet, View } from 'react-native';
import Animated, { FadeOutDown, LinearTransition } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, shadows, spacing } from '@/constants/layout';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { countExpensesByCategory } from '@/utils/categories';
import { alpha } from '@/utils/color';

export default function CategoriasScreen() {
  const { palette, isDark } = useAppTheme();
  const router = useRouter();

  const categories = useFinanceStore((state) => state.categories);
  const deleteCategory = useFinanceStore((state) => state.deleteCategory);
  const expenses = useExpenseStore((state) => state.expenses);
  const moveExpensesByCategory = useExpenseStore((state) => state.moveExpensesByCategory);

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);

  const pending = categories.find((c) => c.id === pendingDelete) ?? null;
  const pendingCount = pending ? countExpensesByCategory(expenses, pending.id) : 0;

  const startDelete = (id: string) => {
    const count = countExpensesByCategory(expenses, id);
    if (count === 0) {
      Alert.alert(
        'Eliminar categoría',
        'La categoría no tiene gastos asociados. ¿Querés eliminarla?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => deleteCategory(id),
          },
        ],
      );
      return;
    }
    setPendingDelete(id);
    setShowMoveModal(true);
  };

  const resolveDelete = (targetId: string | null) => {
    if (!pendingDelete) {
      return;
    }
    // "Sin categoría" (null) keeps expenses with the dangling id.
    if (targetId !== null) {
      moveExpensesByCategory(pendingDelete, targetId);
    }
    deleteCategory(pendingDelete);
    setShowMoveModal(false);
    setPendingDelete(null);
  };

  return (
    <Screen scroll>
      <Header title="Categorías" subtitle={`${categories.length} en uso`} showBack />

      <View style={styles.content}>
        {categories.length === 0 ? (
          <EmptyState
            icon="albums-outline"
            title="No hay categorías"
            message="Creá categorías desde la pantalla de distribución."
          />
        ) : (
          <View style={styles.list}>
            {categories.map((category) => {
              const count = countExpensesByCategory(expenses, category.id);
              return (
                <Animated.View
                  key={category.id}
                  layout={LinearTransition.duration(220)}
                  exiting={FadeOutDown.duration(200)}
                >
                  <View
                    style={[
                      styles.row,
                      shadows.card,
                      { backgroundColor: palette.card, borderColor: palette.border },
                    ]}
                  >
                    <PressableScale
                      onPress={() => router.push(`/categoria?editId=${category.id}`)}
                      scaleTo={0.98}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar ${category.name}`}
                      style={styles.rowMain}
                    >
                      <View
                        style={[
                          styles.icon,
                          { backgroundColor: alpha(category.color, isDark ? 0.25 : 0.14) },
                        ]}
                      >
                        <MaterialCommunityIcons name={category.icon} size={22} color={category.color} />
                      </View>
                      <View style={styles.rowText}>
                        <AppText variant="body" weight="600" numberOfLines={1}>
                          {category.name}
                        </AppText>
                        <AppText variant="caption" tone="tertiary">
                          {count} {count === 1 ? 'gasto' : 'gastos'}
                        </AppText>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={palette.textTertiary} />
                    </PressableScale>
                    <PressableScale
                      onPress={() => startDelete(category.id)}
                      scaleTo={0.88}
                      pressedOpacity={0.6}
                      accessibilityRole="button"
                      accessibilityLabel={`Eliminar ${category.name}`}
                      hitSlop={8}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={palette.danger} />
                    </PressableScale>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}

        <View style={styles.footer}>
          <Button
            label="Nueva categoría"
            icon={<Ionicons name="add" size={18} color={palette.onPrimary} />}
            onPress={() => router.push('/categoria')}
          />
        </View>
      </View>

      <Modal
        visible={showMoveModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoveModal(false)}
      >
        <View style={[styles.overlay, { backgroundColor: palette.overlay }]}>
          <PressableScale
            style={styles.modalBackdrop}
            onPress={() => setShowMoveModal(false)}
            scaleTo={1}
            pressedOpacity={1}
            accessibilityLabel="Cerrar"
          />
          <View style={[styles.sheet, { backgroundColor: palette.card }]}>
            <AppText variant="subtitle">
              {pending ? `Eliminar "${pending.name}"` : 'Eliminar categoría'}
            </AppText>
            <AppText variant="body" tone="secondary">
              {pendingCount} {pendingCount === 1 ? 'gasto usa' : 'gastos usan'} esta categoría. ¿Qué hacés con esos gastos?
            </AppText>

            <View style={styles.moveOptions}>
              {categories
                .filter((c) => c.id !== pendingDelete)
                .map((category) => (
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
                onPress={() => setShowMoveModal(false)}
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
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingRight: spacing.md,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  footer: {
    marginTop: spacing.sm,
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