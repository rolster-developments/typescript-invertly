import { InjectableToken, InjectToken, LocatorOptions } from '../types';

type Reference = string | symbol | LocatorOptions;
type Config<T> = Undefined<LocatorOptions<T>>;

class LocatorStore {
  private collection: Map<InjectToken, LocatorOptions>;

  constructor() {
    this.collection = new Map();
  }

  public save(dependencies: LocatorOptions[]): void {
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

  public request<T = unknown>(token: InjectToken<T>): Config<T> {
    return this.collection.get(token);
  }
}

const locatorStore = new LocatorStore();

export function saveInLocator(dependencies: LocatorOptions[]): void {
  locatorStore.save(dependencies);
}

export function pushInLocator(
  reference: Reference,
  token?: InjectableToken
): void {
  locatorStore.push(reference, token);
}

export function requestInLocator<T = any>(token: InjectToken<T>): Config<T> {
  return locatorStore.request(token);
}
