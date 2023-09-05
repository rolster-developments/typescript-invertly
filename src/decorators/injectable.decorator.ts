import { registerInjectable } from '../factories';

type InjectableConfig = {
  scopeable: boolean;
  singleton: boolean;
};

const defaultConfig: InjectableConfig = {
  scopeable: false,
  singleton: false
};

export function Injectable(config?: Partial<InjectableConfig>): ClassDecorator {
  const finalConfig = { ...defaultConfig, ...config };
  const { scopeable, singleton } = finalConfig;

  return (token) => {
    registerInjectable({ config: { scopeable, singleton, token } });
  };
}
