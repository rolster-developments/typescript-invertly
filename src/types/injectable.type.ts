import { Constructable } from './constructable.type';
import { AbstractContext } from './context.type';

export type InjectableToken<T = any> =
  | object
  | NewableFunction
  | CallableFunction
  | Constructable<T>;

export type InjectToken<T = any> = InjectableToken<T> | string | symbol;

export interface InjectableOptions<T = any> {
  scopeable: boolean;
  singleton: boolean;
  token: InjectableToken<T>;
}

export type InjectOptions<T = any> = {
  index: number;
  parent: InjectableToken;
  scopeable: boolean;
  singleton: boolean;
  token: InjectToken<T>;
};

export interface InjectionOptions<T> {
  token: InjectToken<T>;
  context?: AbstractContext;
}
