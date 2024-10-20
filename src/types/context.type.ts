export interface AbstractContext<K = string> {
  set(key: K, value?: any): void;

  request<T = any>(key: K): Undefined<T>;

  has(key: K): boolean;
}
