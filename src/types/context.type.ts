export interface AbstractContext<K = string> {
  save(key: K, value?: any): void;

  findOrNull<T = any>(key: K): Undefined<T>;

  find<T = any>(key: K): T;

  contain(key: K): boolean;
}
