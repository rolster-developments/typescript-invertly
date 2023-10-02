import { Container } from './container.factory';
import {
  InjectConfig,
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

const rootContainer = new Container();

const createFromInvertly = <T = unknown>({
  config,
  container
}: InjectionOptions<T>): T => {
  return (container || rootContainer).createInjectable(config);
};

export const invertly = <T = unknown>(
  token: InjectableToken<T>,
  { container }: InvertlyOptions = {}
): T => {
  return createFromInvertly({ config: { token }, container });
};

export const registerInjectable = ({
  config,
  container
}: InjectableOptions): void => {
  (container || rootContainer).registerInjectable(config);
};

export const registerInject = ({ config, container }: InjectOptions): void => {
  (container || rootContainer).registerInject(config);
};

export { Container } from './container.factory';

export default createFromInvertly;
