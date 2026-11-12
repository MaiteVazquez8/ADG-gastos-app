import { Image } from 'react-native';

const LOGO_LIGHT = require('@/assets/brand/adg-logo-light.png');
const MARK_LIGHT = require('@/assets/brand/adg-mark-light.png');

interface AdgLogoProps {
  /** 'inline' = mark + "ADG" (headers). 'mark' = solo el símbolo. 'hero' = más grande (perfil/configuración/carga). */
  variant?: 'inline' | 'mark' | 'hero';
}

const INLINE_HEIGHT = 26;
const HERO_HEIGHT = 64;
const MARK_HEIGHT = 44;

const INLINE_ASPECT = 959 / 329;
const MARK_ASPECT = 524 / 329;

/**
 * Logo oficial de ADG (Marketing/Logo · variante clara sobre negro).
 * Nunca redibujar: se usan los PNG originales recortados.
 */
export function AdgLogo({ variant = 'inline' }: AdgLogoProps) {
  if (variant === 'mark') {
    return (
      <Image
        source={MARK_LIGHT}
        style={{ height: MARK_HEIGHT, aspectRatio: MARK_ASPECT }}
        resizeMode="contain"
        accessibilityLabel="ADG"
      />
    );
  }

  const height = variant === 'hero' ? HERO_HEIGHT : INLINE_HEIGHT;
  return (
    <Image
      source={LOGO_LIGHT}
      style={{ height, aspectRatio: INLINE_ASPECT }}
      resizeMode="contain"
      accessibilityLabel="ADG — Administración Digital de Gastos"
    />
  );
}
