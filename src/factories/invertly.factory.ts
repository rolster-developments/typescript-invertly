import { InjectOptions, InjectToken } from '../types/inject.type';
import {
  InjectableOptions,
  InjectableToken,
  InjectionOptions
} from '../types/injectable.type';
import { InvertlyContainer } from './container.factory';

const INVERTLY_CONTAINER = new InvertlyContainer();

interface Inject<T = any> {
  token: InjectToken<T>;
  index?: number;
  scopeable?: boolean;
  singleton?: boolean;
}

interface DependencyOptions {
  container?: InvertlyContainer;
  injects?: Inject[];
  scopeable?: boolean;
  singleton?: boolean;
}

function createFromInvertly<T = any>(
  options: InjectionOptions<T>,
  container?: InvertlyContainer
): T {
  return (container ?? INVERTLY_CONTAINER).createInjectable(options);
}

export function invertly<T = any>(
  token: InjectableToken<T>,
  container?: InvertlyContainer
): T {
  return createFromInvertly({ token }, container);
}

export function registerInjectable(
  options: InjectableOptions,
  container?: InvertlyContainer
): void {
  (container ?? INVERTLY_CONTAINER).registerInjectable(options);
}

export function registerInject(
  options: InjectOptions,
  container?: InvertlyContainer
): void {
  (container ?? INVERTLY_CONTAINER).registerInject(options);
}

export function registerDependency<T = any>(
  token: InjectableToken<T>,
  options: DependencyOptions
): void {
  registerInjectable(
    {
      token,
      scopeable: options.scopeable ?? false,
      singleton: options.singleton ?? false
    },
    options.container
  );

  options.injects?.forEach((inject, indexParent) => {
    registerInject(
      {
        index: inject.index ?? indexParent,
        parent: token,
        scopeable: inject.scopeable ?? options.scopeable ?? false,
        singleton: inject.singleton ?? options.singleton ?? false,
        token: inject.token
      },
      options.container
    );
  });
}

export { InvertlyContainer } from './container.factory';

export default createFromInvertly;
