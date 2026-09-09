import { useEffect, useState } from 'react';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useFinanceStore } from '@/store/useFinanceStore';

const stores = [useExpenseStore, useFinanceStore];

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