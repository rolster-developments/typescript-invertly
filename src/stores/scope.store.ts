import { InjectableToken } from '../types';

export class ScopeStore {
  private readonly collection: Map<InjectableToken, any>;

  constructor() {
    this.collection = new Map();
  }

  public push(token: InjectableToken, value: any): void {
    this.collection.set(token, value);
  }

  public request<T = any>(token: InjectableToken): T {
    return this.collection.get(token) as T;
  }
}
