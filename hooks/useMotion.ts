import { useSettingsStore } from '@/store/useSettingsStore';

/**
 * Motion (mock: Preferencias → Motion). Cuando está desactivado, las
 * animaciones de entrada se simplifican/omiten.
 */
export function useMotion(): boolean {
  return useSettingsStore((state) => state.motion);
}
