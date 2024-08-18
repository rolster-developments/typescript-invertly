import { AbstractContext } from '../types';

export class Context extends Map<string, unknown> implements AbstractContext {
  public request<T = any>(key: string): Undefined<T> {
    return this.has(key) ? (this.get(key) as T) : undefined;
  }
}
