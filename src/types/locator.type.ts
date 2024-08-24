import { InjectToken } from './inject.type';
import { InjectableToken } from './injectable.type';

export type LocatorOptions<T = any> = {
  token: InjectToken;
  useClass: InjectableToken<T>;
  scopeable?: boolean;
  singleton?: boolean;
};
