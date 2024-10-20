import { AbstractContext } from '../types';

export class Context<K = string> implements AbstractContext<K> {
  private store: Map<K, any> = new Map();

  public set(key: K, value?: any): void {
    this.store.set(key, value);
  }

  public request<T = any>(key: K): Undefined<T> {
    return this.store.get(key);
  }

  public has(key: K): boolean {
    return this.store.has(key);
  }
}
