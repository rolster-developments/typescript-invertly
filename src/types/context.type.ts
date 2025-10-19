export interface AbstractContext<K = string> {
  save(key: K, value?: any): void;

  findOrNullByKey<T = any>(key: K): Undefined<T>;

  findByKey<T = any>(key: K): T;

  contain(key: K): boolean;
}
