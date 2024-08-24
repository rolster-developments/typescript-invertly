import {
  InjectOptions,
  InjectToken,
  InjectableOptions,
  InjectableToken,
  InjectionOptions
} from '../types';
import { Container } from './container.factory';

interface Inject<T = any> {
  token: InjectToken<T>;
  index?: number;
  scopeable?: boolean;
  singleton?: boolean;
}

interface DependencyOptions {
  container?: Container;
  injects?: Inject[];
  scopeable?: boolean;
  singleton?: boolean;
}

const invertlyContainer = new Container();

function createFromInvertly<T = any>(
  options: InjectionOptions<T>,
  container?: Container
): T {
  return (container || invertlyContainer).createInjectable(options);
}

export function invertly<T = any>(
  token: InjectableToken<T>,
  container?: Container
): T {
  return createFromInvertly({ token }, container);
}

export function registerInjectable(
  options: InjectableOptions,
  container?: Container
): void {
  (container || invertlyContainer).registerInjectable(options);
}

export function registerInject(
  options: InjectOptions,
  container?: Container
): void {
  (container || invertlyContainer).registerInject(options);
}

export function registerDependency<T = any>(
  token: InjectableToken<T>,
  options: DependencyOptions
): void {
  const { container, injects, scopeable, singleton } = options;

  registerInjectable(
    {
      token,
      scopeable: scopeable || false,
      singleton: singleton || false
    },
    container
  );

  injects?.forEach((inject, indexParent) => {
    const {
      index,
      scopeable: childrenScopeable,
      singleton: childrenSingleton,
      token: childrenToken
    } = inject;

    registerInject(
      {
        index: index || indexParent,
        parent: token,
        scopeable: childrenScopeable || scopeable || false,
        singleton: childrenSingleton || singleton || false,
        token: childrenToken
      },
      container
    );
  });
}

export { Container } from './container.factory';

export default createFromInvertly;
