import { InjectableToken, InjectOptions } from '../types';

export class InjectStore {
  private collection: Map<InjectableToken, InjectOptions[]> = new Map();

  public push(options: InjectOptions): void {
    const { parent, index } = options;

    const injects = this.request(parent);

    injects[index] = options;
  }

  public request(token: InjectableToken): InjectOptions[] {
    const current = this.collection.get(token);

    if (current) {
      return current;
    }

    const injects: InjectOptions[] = [];

    this.collection.set(token, injects);

    return injects;
  }
}
