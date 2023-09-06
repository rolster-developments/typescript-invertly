import { InjectableToken } from '../types/injectable.type';

export class ScopeStore {
  private readonly collection: Map<InjectableToken, unknown>;

  constructor() {
    this.collection = new Map();
  }

  public push(token: InjectableToken, value: unknown): void {
    this.collection.set(token, value);
  }

  public fetch<T = unknown>(token: InjectableToken): T {
    return this.collection.get(token) as T;
  }
}
