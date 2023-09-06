import createFromInvertly from './factories';

export { Factory, Injectable, Scope, Singleton } from './decorators';
export {
  Container,
  invertly,
  registerInject,
  registerInjectable
} from './factories';
export { Context, fetchInLocator, pushInLocator, saveInLocator } from './stores';
export { InjectableToken, InjectToken, LocatorConfig } from './types';

export default createFromInvertly;
