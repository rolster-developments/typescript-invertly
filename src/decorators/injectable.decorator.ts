import { registerInjectable } from '../factories/invertly.factory';

interface InjectableOptions {
  scopeable?: boolean;
  singleton?: boolean;
}

export function Injectable(options?: InjectableOptions): ClassDecorator {
  return (token) => {
    registerInjectable({
      scopeable: !!options?.scopeable,
      singleton: !!options?.singleton,
      token
    });
  };
}
