import { SecureMap } from '@rolster/commons';

import { InjectOptions, InjectToken } from '../types/injectable.type';

export class InjectStore {
  private collection: SecureMap<InjectOptions[], InjectToken>;

  constructor() {
    this.collection = new SecureMap(() => []);
  }

  public push(options: InjectOptions): void {
    const injects = this.collection.request(options.parent);

    injects[options.index] = options;
  }

  public request(token: InjectToken): InjectOptions[] {
    return this.collection.request(token);
  }
}
