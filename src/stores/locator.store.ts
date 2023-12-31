import { InjectableToken, InjectToken, LocatorConfig } from '../types';

type Reference = string | symbol | LocatorConfig;
type Config<T> = Undefined<LocatorConfig<T>>;

class LocatorStore {
  private collection: Map<InjectToken, LocatorConfig>;

  constructor() {
    this.collection = new Map();
  }

  public save(dependencies: LocatorConfig[]): void {
    dependencies.forEach((config) => {
      this.collection.set(config.token, config);
    });
  }

  public push(reference: Reference, token?: InjectableToken): void {
    if (typeof reference !== 'string' && typeof reference !== 'symbol') {
      const { token, useClass } = reference;

      this.collection.set(token, { token, useClass });
    } else if (token) {
      this.collection.set(reference, { token, useClass: token });
    }
  }

  public fetch<T = unknown>(token: InjectToken<T>): Config<T> {
    return this.collection.get(token);
  }
}

const locatorStore = new LocatorStore();

export function saveInLocator(dependencies: LocatorConfig[]): void {
  locatorStore.save(dependencies);
}

export function pushInLocator(
  reference: Reference,
  token?: InjectableToken
): void {
  locatorStore.push(reference, token);
}

export function fetchInLocator<T = unknown>(token: InjectToken<T>): Config<T> {
  return locatorStore.fetch(token);
}
