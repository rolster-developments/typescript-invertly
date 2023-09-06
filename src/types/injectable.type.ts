import { Constructable } from './constructable.type';
import { AbstractContext } from './context.type';

export type InjectableToken<T = unknown> =
  | Object
  | Function
  | CallableFunction
  | Constructable<T>;

export interface InjectableConfig<T = unknown> {
  scopeable: boolean;
  singleton: boolean;
  token: InjectableToken<T>;
}

export interface InjectionConfig<T> {
  token: InjectableToken<T>;
  context?: AbstractContext;
}
