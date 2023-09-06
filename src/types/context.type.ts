export interface AbstractContext {
  fetch<T = unknown>(key: string): Undefined<T>;
}
