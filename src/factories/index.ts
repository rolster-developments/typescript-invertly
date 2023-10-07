import { Container } from './container.factory';
import {
  InjectConfig,
  InjectToken,
  InjectableConfig,
  InjectableToken,
  InjectionConfig
} from '../types';

interface InjectionOptions<T> {
  config: InjectionConfig<T>;
  container?: Container;
}

interface InvertlyOptions {
  container?: Container;
}

interface InjectableOptions {
  config: InjectableConfig;
  container?: Container;
}

interface InjectOptions {
  config: InjectConfig;
  container?: Container;
}

interface DependencyConfig<T = unknown> {
  token: InjectToken<T>;
  index?: number;
  scopeable?: boolean;
  singleton?: boolean;
}

interface DependencyOptions {
  container?: Container;
  injects?: DependencyConfig[];
  scopeable?: boolean;
  singleton?: boolean;
}

const rootContainer = new Container();

const createFromInvertly = <T = unknown>(options: InjectionOptions<T>): T => {
  const { config, container } = options;

  return (container || rootContainer).createInjectable(config);
};

export const invertly = <T = unknown>(
  token: InjectableToken<T>,
  { container }: InvertlyOptions = {}
): T => {
  return createFromInvertly({ config: { token }, container });
};

export const registerInjectable = (options: InjectableOptions): void => {
  const { config, container } = options;

  (container || rootContainer).registerInjectable(config);
};

export const registerInject = (options: InjectOptions): void => {
  const { config, container } = options;

  (container || rootContainer).registerInject(config);
};

export const registerDependency = <T = unknown>(
  token: InjectableToken<T>,
  options: DependencyOptions
): void => {
  const { container, injects, scopeable, singleton } = options;

  registerInjectable({
    config: {
      token,
      scopeable: scopeable || false,
      singleton: singleton || false
    },
    container
  });

  injects?.forEach((inject, indexParent) => {
    const {
      index,
      scopeable: childrenScopeable,
      singleton: childrenSingleton,
      token: childrenToken
    } = inject;

    registerInject({
      config: {
        index: index || indexParent,
        parent: token,
        scopeable: childrenScopeable || scopeable || false,
        singleton: childrenSingleton || singleton || false,
        token: childrenToken
      },
      container
    });
  });
};

export { Container } from './container.factory';

export default createFromInvertly;
