import { InjectableToken, InjectToken } from './injectable.type';

export type LocatorClassOptions<T = any> = {
  token: InjectToken;
  useClass: InjectableToken<T>;
  scopeable?: boolean;
  singleton?: boolean;
};

export type LocatorValueOptions<T = any> = {
  token: InjectToken;
  useValue: T;
};

export type LocatorOptions<T = any> =
  | LocatorClassOptions<T>
  | LocatorValueOptions<T>;
