import { Container } from './container.factory';
import {
  InjectConfig,
  InjectableConfig,
  InjectableToken,
  InjectionConfig
} from '../types';

interface Injection<T> {
  config: InjectionConfig<T>;
  container?: Container;
}

interface Token<T> {
  token: InjectableToken<T>;
  container?: Container;
}

interface Injectable {
  config: InjectableConfig;
  container?: Container;
}

interface Inject {
  config: InjectConfig;
  container?: Container;
}

const rootContainer = new Container();

function createFromInvertly<T = unknown>({
  config,
  container
}: Injection<T>): T {
  return (container || rootContainer).createInjectable(config);
}

export function invertly<T = unknown>({ token, container }: Token<T>): T {
  return createFromInvertly({ config: { token }, container });
}

export function registerInjectable({ config, container }: Injectable): void {
  (container || rootContainer).registerInjectable(config);
}

export function registerInject({ config, container }: Inject): void {
  (container || rootContainer).registerInject(config);
}

export { Container } from './container.factory';

export default createFromInvertly;
