import { useEffect, useState } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthStore } from '@/store/useMonthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useThemeStore } from '@/store/useThemeStore';

const stores = [
  useExpenseStore,
  useFinanceStore,
  useSettingsStore,
  useBudgetStore,
  useMonthStore,
  useThemeStore,
];

function allHydrated(): boolean {
  return stores.every((store) => store.persist.hasHydrated());
}

/** Returns true once all persisted data has been loaded from storage. */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState<boolean>(allHydrated());

  useEffect(() => {
    setHydrated(allHydrated());
    const unsubscribes = stores.map((store) =>
      store.persist.onFinishHydration(() => {
        if (allHydrated()) {
          setHydrated(true);
        }
      }),
    );
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return hydrated;
}
