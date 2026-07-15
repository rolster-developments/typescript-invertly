import { Constructable } from './constructable.type';

export type InjectableToken<T = any> =
  | object
  | NewableFunction
  | CallableFunction
  | Constructable<T>;

export interface InjectableOptions<T = any> {
  scopeable: boolean;
  singleton: boolean;
  token: InjectableToken<T>;
}
