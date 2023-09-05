import { InjectableToken } from './injectable.type';

export type InjectToken<T = unknown> = InjectableToken<T> | string | symbol;

export type InjectConfig<T = unknown> = {
  index: number;
  parent: InjectableToken;
  scopeable: boolean;
  singleton: boolean;
  token: InjectToken<T>;
};
