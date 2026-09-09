/**
 * In-memory AsyncStorage shim used by `test:stores`. Loaded by the alias
 * loader in place of @react-native-async-storage/async-storage so the real
 * stores can be exercised (and rehydrated) inside plain Node.
 */
const data = new Map();

const AsyncStorageMock = {
  async getItem(key) {
    return data.has(key) ? data.get(key) : null;
  },
  async setItem(key, value) {
    data.set(key, value);
  },
  async removeItem(key) {
    data.delete(key);
  },
  async clear() {
    data.clear();
  },
  async getAllKeys() {
    return [...data.keys()];
  },
};

export default AsyncStorageMock;

export function __reset() {
  data.clear();
}

/** Returns a plain object snapshot of the stored values (for assertions). */
export function __dump() {
  return Object.fromEntries(data.entries());
}