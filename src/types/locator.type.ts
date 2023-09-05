import { InjectToken } from './inject.type';
import { InjectableToken } from './injectable.type';

export type LocatorConfig<T = unknown> = {
  token: InjectToken;
  useClass: InjectableToken<T>;
  scopeable?: boolean;
  singleton?: boolean;
};
