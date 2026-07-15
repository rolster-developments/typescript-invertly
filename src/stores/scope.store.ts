import { InjectToken } from '../types/injectable.type';

export class ScopeStore {
  private readonly collection: Map<InjectToken, any> = new Map();

  public push(token: InjectToken, value: any): void {
    this.collection.set(token, value);
  }

  public request<T = any>(token: InjectToken): T {
    return this.collection.get(token);
  }
}
