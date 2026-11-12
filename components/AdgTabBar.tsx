import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { spacing } from '@/constants/layout';

type TabKey = 'index' | 'actividad' | 'agregar' | 'analisis' | 'perfil';

/** Structural subset of BottomTabBarProps (avoids depending on internal paths). */
export interface AdgTabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    navigate: (name: string) => void;
  };
}

/**
 * Mapa de TODAS las rutas de la app a la pestaña que muestran como activa
 * (según el mock): todos los movimientos/ingresos/categorías viven en
 * "Actividad", los flujos de alta y el guardado en "Agregar", presupuestos y
 * análisis en "Análisis", y perfil/configuración en "Perfil".
 */
const ROUTE_TO_TAB: Record<string, TabKey> = {
  index: 'index',
  actividad: 'actividad',
  agregar: 'agregar',
  analisis: 'analisis',
  perfil: 'perfil',
  historial: 'actividad',
  ingresos: 'actividad',
  categorias: 'actividad',
  categoria: 'actividad',
  filtros: 'actividad',
  'expense/[id]': 'actividad',
  distribucion: 'perfil',
  'distribucion-predeterminada': 'perfil',
  'gasto-guardado': 'agregar',
  presupuestos: 'analisis',
  'editar-limite': 'analisis',
  comparacion: 'analisis',
  preferencias: 'perfil',
  configuracion: 'perfil',
  'carga-resumen': 'actividad',
};

const TAB_ORDER: TabKey[] = ['index', 'actividad', 'agregar', 'analisis', 'perfil'];

const TAB_META: Record<TabKey, { label: string }> = {
  index: { label: 'Inicio' },
  actividad: { label: 'Actividad' },
  agregar: { label: 'Agregar' },
  analisis: { label: 'Análisis' },
  perfil: { label: 'Perfil' },
};

function TabIcon({ tab, active, color }: { tab: TabKey; active: boolean; color: string }) {
  const size = 22;
  switch (tab) {
    case 'index':
      return <Ionicons name={active ? 'home' : 'home-outline'} size={size} color={color} />;
    case 'actividad':
      return <MaterialCommunityIcons name="format-list-bulleted-square" size={size} color={color} />;
    case 'agregar':
      return <Ionicons name="add" size={size + 4} color={color} />;
    case 'analisis':
      return <Ionicons name={active ? 'bar-chart' : 'bar-chart-outline'} size={size} color={color} />;
    case 'perfil':
      return <Ionicons name={active ? 'settings' : 'settings-outline'} size={size} color={color} />;
  }
}

/**
 * Tab bar de ADG (mock "Componentes y sistema visual"): 5 secciones,
 * icono + etiqueta, activa en verde. En pantallas anchas (>= 980dp) se
 * oculta — la navegación pasa a la barra lateral (mock escritorio).
 */
export function AdgTabBar({ state, navigation }: AdgTabBarProps) {
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  if (width >= 980) {
    return null;
  }

  const currentRoute = state.routes[state.index];
  const routeName = currentRoute?.name ?? 'index';
  const activeTab = ROUTE_TO_TAB[routeName] ?? 'index';

  const navigate = (tab: TabKey) => {
    navigation.navigate(tab);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          borderTopColor: palette.border,
          paddingBottom: Math.max(insets.bottom, spacing.xs),
        },
      ]}
      accessibilityRole="tablist"
    >
      {TAB_ORDER.map((tab) => {
        const focused = tab === activeTab;
        const color = focused ? palette.primary : palette.textSecondary;
        return (
          <Pressable
            key={tab}
            onPress={() => navigate(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={TAB_META[tab].label}
            style={styles.tab}
            hitSlop={4}
          >
            <TabIcon tab={tab} active={focused} color={color} />
            <AppText
              variant="caption"
              weight={focused ? '600' : '500'}
              style={{ color, fontSize: 11 }}
              numberOfLines={1}
            >
              {TAB_META[tab].label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 44,
  },
});
