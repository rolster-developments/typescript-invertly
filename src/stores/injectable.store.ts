import { InjectableOptions, InjectableToken } from '../types';

type Options<T> = Undefined<InjectableOptions<T>>;

export class InjectableStore {
  private collection: Map<InjectableToken, InjectableOptions> = new Map();

  public push(options: InjectableOptions): void {
    this.collection.set(options.token, options);
  }

  public request<T = any>(token: InjectableToken<T>): Options<T> {
    return this.collection.get(token);
  }
}
