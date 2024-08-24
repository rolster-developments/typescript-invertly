import createFromInvertly from './factories';

export { Factory, Injectable, Scope, Singleton } from './decorators';
export {
  Container,
  invertly,
  registerDependency,
  registerInject,
  registerInjectable
} from './factories';
export {
  Context,
  requestInLocator,
  pushInLocator,
  saveInLocator
} from './stores';
export {
  Constructable,
  InjectableToken,
  InjectToken,
  LocatorOptions
} from './types';

export default createFromInvertly;
