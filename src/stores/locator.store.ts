import { InjectableToken, InjectToken } from '../types/injectable.type';
import { LocatorOptions } from '../types/locator.type';

type Reference = string | symbol | LocatorOptions;
type Options<T> = Undefined<LocatorOptions<T>>;

class LocatorStore {
  private collection: Map<InjectToken, LocatorOptions> = new Map();

  public save(options: LocatorOptions[]): void {
    options.forEach((option) => {
      this.collection.set(option.token, option);
    });
  }

  public push(reference: Reference, token?: InjectableToken): void {
    if (typeof reference !== 'string' && typeof reference !== 'symbol') {
      this.collection.set(reference.token, reference);
    } else if (token) {
      this.collection.set(reference, { token, useClass: token });
    }
  }

  public find<T = unknown>(token: InjectToken<T>): Options<T> {
    return this.collection.get(token);
  }
}

const LOCATOR_STORE = new LocatorStore();

export function findInLocator<T = any>(token: InjectToken<T>): Options<T> {
  return LOCATOR_STORE.find(token);
}

export function saveInLocator(dependencies: LocatorOptions[]): void {
  LOCATOR_STORE.save(dependencies);
}

export function pushInLocator(
  reference: Reference,
  token?: InjectableToken
): void {
  LOCATOR_STORE.push(reference, token);
}
