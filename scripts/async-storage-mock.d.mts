declare const AsyncStorageMock: {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export default AsyncStorageMock;
export declare function __reset(): void;
export declare function __dump(): Record<string, string>;