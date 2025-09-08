import { AbstractContext } from '../types/context.type';

export class Context<K = string> implements AbstractContext<K> {
  private store: Map<K, any> = new Map();

  public save(key: K, value?: any): void {
    this.store.set(key, value);
  }

  public findOrNull<T = any>(key: K): Undefined<T> {
    return this.store.get(key);
  }

  public find<T = any>(key: K): T {
    return this.store.get(key);
  }

  public contain(key: K): boolean {
    return this.store.has(key);
  }
}
