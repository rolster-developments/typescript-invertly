import { InjectableConfig, InjectableToken } from '../types';

type Config<T> = Undefined<InjectableConfig<T>>;

export class InjectableStore {
  private collection: Map<InjectableToken, InjectableConfig> = new Map();

  public push(config: InjectableConfig): void {
    this.collection.set(config.token, config);
  }

  public fetch<T = unknown>(token: InjectableToken<T>): Config<T> {
    return this.collection.get(token);
  }
}
