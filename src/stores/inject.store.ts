import { SecureMap } from '@rolster/commons';
import { InjectableToken, InjectOptions } from '../types';

export class InjectStore {
  private collection: SecureMap<InjectOptions[], InjectableToken>;

  constructor() {
    this.collection = new SecureMap(() => []);
  }

  public push(options: InjectOptions): void {
    const injects = this.collection.request(options.parent);

    injects[options.index] = options;
  }

  public request(token: InjectableToken): InjectOptions[] {
    return this.collection.request(token);
  }
}
