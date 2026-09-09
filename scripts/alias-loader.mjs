/**
 * Node ESM resolve hook for `npm run test:logic` and `npm run test:stores`:
 * - maps the app alias "@/" (tsconfig.json ".\/") to absolute file URLs so
 *   plain `node` can load the source modules, and
 * - swaps @react-native-async-storage/async-storage for an in-memory shim so
 *   the zustand stores can run (and be persisted/rehydrated) in Node.
 */
const ROOT = new URL('../', import.meta.url);
const ASYNC_STORAGE_MOCK = new URL('./async-storage-mock.mjs', import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@react-native-async-storage/async-storage') {
    return nextResolve(ASYNC_STORAGE_MOCK.href, context);
  }
  if (specifier.startsWith('@/')) {
    let target = specifier.slice(2);
    if (!target.endsWith('.ts')) {
      target = `${target}.ts`;
    }
    return nextResolve(new URL(target, ROOT).href, context);
  }
  return nextResolve(specifier, context);
}