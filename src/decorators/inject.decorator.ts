import { registerInject } from '../factories/invertly.factory';
import { InjectToken } from '../types/injectable.type';

interface InjectOptions {
  scopeable: boolean;
  singleton: boolean;
  token: InjectToken;
}

function createInject(inject: InjectOptions): ParameterDecorator {
  return (parent, _, index) => {
    registerInject({ ...inject, index, parent });
  };
}

export function Singleton(token: InjectToken): ParameterDecorator {
  return createInject({ token, scopeable: false, singleton: true });
}

export function Scope(token: InjectToken): ParameterDecorator {
  return createInject({ token, scopeable: true, singleton: false });
}

export function Factory(token: InjectToken): ParameterDecorator {
  return createInject({ token, scopeable: false, singleton: false });
}
