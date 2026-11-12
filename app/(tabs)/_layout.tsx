import { Tabs } from 'expo-router';
import { useAppTheme } from '@/components/ThemeProvider';
import { AdgTabBar } from '@/components/AdgTabBar';

/**
 * Navegación principal de ADG (mock): Inicio · Actividad · Agregar · Análisis
 * · Perfil. Todas las demás pantallas viven acá como pestañas ocultas
 * (href: null) para mantener la tab bar visible y la pestaña contextual
 * activa como en el mock.
 */
export default function TabsLayout() {
  const { palette } = useAppTheme();

  return (
    <Tabs
      tabBar={(props) => <AdgTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
        animation: 'shift',
      }}
    >
      {/* Pestañas visibles */}
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="actividad" options={{ title: 'Actividad' }} />
      <Tabs.Screen name="agregar" options={{ title: 'Agregar' }} />
      <Tabs.Screen name="analisis" options={{ title: 'Análisis' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />

      {/* Pantallas ocultas con la tab bar visible (mapeo contextual en AdgTabBar) */}
      <Tabs.Screen name="ingresos" options={{ title: 'Ingresos', href: null }} />
      <Tabs.Screen name="categorias" options={{ title: 'Categorías', href: null }} />
      <Tabs.Screen name="categoria" options={{ title: 'Nueva categoría', href: null }} />
      <Tabs.Screen name="presupuestos" options={{ title: 'Presupuestos', href: null }} />
      <Tabs.Screen name="editar-limite" options={{ title: 'Editar límite', href: null }} />
      <Tabs.Screen name="comparacion" options={{ title: 'Comparación', href: null }} />
      <Tabs.Screen name="historial" options={{ title: 'Historial', href: null }} />
      <Tabs.Screen name="filtros" options={{ title: 'Filtros', href: null }} />
      <Tabs.Screen name="preferencias" options={{ title: 'Preferencias', href: null }} />
      <Tabs.Screen name="configuracion" options={{ title: 'Configuración', href: null }} />
      <Tabs.Screen name="gasto-guardado" options={{ title: 'Gasto guardado', href: null }} />
      <Tabs.Screen name="carga-resumen" options={{ title: 'Carga del resumen', href: null }} />
      <Tabs.Screen name="expense/[id]" options={{ title: 'Detalle del movimiento', href: null }} />
      <Tabs.Screen name="distribucion" options={{ title: 'Distribución', href: null }} />
      <Tabs.Screen name="distribucion-predeterminada" options={{ title: 'Distribución habitual', href: null }} />
    </Tabs>
  );
}
