import { InjectConfig } from '../types/inject.type';
import { InjectableToken } from '../types/injectable.type';

export class InjectStore {
  private collection: Map<InjectableToken, InjectConfig[]> = new Map();

  public push(config: InjectConfig): void {
    const { parent, index } = config;

    const injects = this.fetch(parent);

    injects[index] = config;
  }

  public fetch(token: InjectableToken): InjectConfig[] {
    const current = this.collection.get(token);

    if (current) {
      return current;
    }

    const injects: InjectConfig[] = [];

    this.collection.set(token, injects);

    return injects;
  }
}
