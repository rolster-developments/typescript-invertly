export interface AbstractContext {
  request<T = unknown>(key: string): Undefined<T>;
}
