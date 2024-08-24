export interface AbstractContext<K = string> {
  request<T = any>(key: K): Undefined<T>;
}
