export interface AbstractContext<K = string> {
  contain(key: K): boolean;

  findByKey<T = any>(key: K): T;

  findOrNullByKey<T = any>(key: K): Undefined<T>;

  save(key: K, value?: any): void;
}
