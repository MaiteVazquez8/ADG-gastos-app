import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AdgLogo } from '@/components/AdgLogo';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/components/ThemeProvider';
import { AppText } from '@/components/Text';
import { radius, spacing } from '@/constants/layout';
import { PROFILE_LABEL } from '@/constants/demo-data';
import { alpha } from '@/utils/color';

type SidebarKey =
  | 'index'
  | 'actividad'
  | 'ingresos'
  | 'categorias'
  | 'presupuestos'
  | 'analisis'
  | 'historial';

const ITEMS: {
  key: SidebarKey;
  label: string;
  route: '/' | '/actividad' | '/ingresos' | '/categorias' | '/presupuestos' | '/analisis' | '/historial';
  icon: (color: string) => ReactNode;
}[] = [
  { key: 'index', label: 'Inicio', route: '/', icon: (color) => <Ionicons name="home-outline" size={20} color={color} /> },
  { key: 'actividad', label: 'Movimientos', route: '/actividad', icon: (color) => <MaterialCommunityIcons name="format-list-bulleted-square" size={20} color={color} /> },
  { key: 'ingresos', label: 'Ingresos', route: '/ingresos', icon: (color) => <Ionicons name="business-outline" size={20} color={color} /> },
  { key: 'categorias', label: 'Categorías', route: '/categorias', icon: (color) => <Ionicons name="pricetag-outline" size={20} color={color} /> },
  { key: 'presupuestos', label: 'Presupuestos', route: '/presupuestos', icon: (color) => <Ionicons name="wallet-outline" size={20} color={color} /> },
  { key: 'analisis', label: 'Estadísticas', route: '/analisis', icon: (color) => <Ionicons name="bar-chart-outline" size={20} color={color} /> },
  { key: 'historial', label: 'Historial', route: '/historial', icon: (color) => <Ionicons name="time-outline" size={20} color={color} /> },
];

function activeKeyFor(pathname: string): SidebarKey | null {
  if (pathname === '/' || pathname === '/index') return 'index';
  if (
    pathname.startsWith('/actividad') ||
    pathname.startsWith('/filtros') ||
    pathname.startsWith('/expense') ||
    pathname.startsWith('/agregar') ||
    pathname.startsWith('/gasto-guardado') ||
    pathname.startsWith('/carga-resumen')
  ) {
    return 'actividad';
  }
  if (pathname.startsWith('/ingresos')) return 'ingresos';
  if (pathname.startsWith('/categoria')) return 'categorias';
  if (pathname.startsWith('/presupuestos') || pathname.startsWith('/editar-limite')) return 'presupuestos';
  if (pathname.startsWith('/analisis') || pathname.startsWith('/comparacion')) return 'analisis';
  if (pathname.startsWith('/historial')) return 'historial';
  return null;
}

/**
 * Barra lateral de ADG para pantallas anchas (mock escritorio): logo,
 * navegación de secciones y acceso al perfil abajo.
 */
export function DesktopSidebar() {
  const { palette, isDark } = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();
  const active = activeKeyFor(pathname);

  return (
    <View style={[styles.sidebar, { borderRightColor: palette.border }]}>
      <PressableScale onPress={() => router.navigate('/')} accessibilityRole="button" accessibilityLabel="Ir al inicio" style={styles.logo}>
        <AdgLogo variant="inline" />
      </PressableScale>

      <View style={styles.nav}>
        {ITEMS.map((item) => {
          const selected = item.key === active;
          const color = selected ? palette.primary : palette.textSecondary;
          return (
            <PressableScale
              key={item.key}
              onPress={() => router.navigate(item.route)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              style={[
                styles.item,
                selected && { backgroundColor: alpha(palette.primary, isDark ? 0.14 : 0.18) },
              ]}
            >
              {item.icon(color)}
              <AppText variant="body" weight={selected ? '600' : '400'} style={{ color }}>
                {item.label}
              </AppText>
            </PressableScale>
          );
        })}
      </View>

      <View style={styles.footer}>
        <AppText variant="body" weight="700" numberOfLines={1}>
          {PROFILE_LABEL}
        </AppText>
        <PressableScale
          onPress={() => router.navigate('/perfil')}
          accessibilityRole="button"
          accessibilityLabel="Perfil y configuración"
          hitSlop={6}
        >
          <AppText variant="label" tone="accent" weight="600">
            Perfil y configuración ›
          </AppText>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 264,
    backgroundColor: '#000000',
    borderRightWidth: 1,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  logo: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  nav: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  footer: {
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
});
