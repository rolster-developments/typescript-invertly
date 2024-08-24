import { InjectableToken } from './injectable.type';

export type InjectToken<T = any> = InjectableToken<T> | string | symbol;

export type InjectOptions<T = any> = {
  index: number;
  parent: InjectableToken;
  scopeable: boolean;
  singleton: boolean;
  token: InjectToken<T>;
};
