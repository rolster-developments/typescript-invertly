import { Constructable } from './constructable.type';
import { AbstractContext } from './context.type';

export type InjectableToken<T = any> =
  | Object
  | Function
  | CallableFunction
  | Constructable<T>;

export interface InjectableOptions<T = any> {
  scopeable: boolean;
  singleton: boolean;
  token: InjectableToken<T>;
}

export interface InjectionOptions<T> {
  token: InjectableToken<T>;
  context?: AbstractContext;
}
