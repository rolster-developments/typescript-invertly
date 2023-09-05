import { Builder } from './factory';
import {
  InjectConfig,
  InjectableConfig,
  InjectableToken,
  InjectionConfig
} from '../types';

interface Injection<T> {
  config: InjectionConfig<T>;
  builder?: Builder;
}

interface Token<T> {
  token: InjectableToken<T>;
  builder?: Builder;
}

interface Injectable {
  config: InjectableConfig;
  builder?: Builder;
}

interface Inject {
  config: InjectConfig;
  builder?: Builder;
}

const superBuilder = new Builder();

function factoryInject<T = unknown>({ config, builder }: Injection<T>): T {
  return (builder || superBuilder).createInjectable(config);
}

export function inject<T = unknown>({ token, builder }: Token<T>): T {
  return factoryInject({ config: { token }, builder });
}

export function registerInjectable({ config, builder }: Injectable): void {
  (builder || superBuilder).registerInjectable(config);
}

export function registerInject({ config, builder }: Inject): void {
  (builder || superBuilder).registerInject(config);
}

export function printInjectables(): void {
  superBuilder.printInjectables();
}

export function printInjects(): void {
  superBuilder.printInjects();
}

export { Builder } from './factory';

export default factoryInject;
