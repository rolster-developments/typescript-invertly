import { AbstractContext } from '../types';

export class Context<K = string>
  extends Map<K, any>
  implements AbstractContext<K>
{
  public request<T = any>(key: K): Undefined<T> {
    return this.get(key);
  }
}
