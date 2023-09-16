import { registerInjectable } from '../factories';

type InjectableConfig = {
  scopeable: boolean;
  singleton: boolean;
};

const DEFAULT_CONFIG: InjectableConfig = {
  scopeable: false,
  singleton: false
};

export const Injectable = (
  config?: Partial<InjectableConfig>
): ClassDecorator => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { scopeable, singleton } = finalConfig;

  return (token) => {
    registerInjectable({ config: { scopeable, singleton, token } });
  };
};
