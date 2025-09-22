import createFromInvertly from './factories/invertly.factory';

export { Factory, Scope, Singleton } from './decorators/inject.decorator';
export { Injectable } from './decorators/injectable.decorator';
export {
  InvertlyContainer,
  invertly,
  registerDependency,
  registerInject,
  registerInjectable
} from './factories/invertly.factory';
export { Context } from './stores/context.store';
export {
  findInLocator,
  pushInLocator,
  saveInLocator
} from './stores/locator.store';
export { Constructable } from './types/constructable.type';
export { InjectToken } from './types/inject.type';
export { InjectableToken } from './types/injectable.type';
export { LocatorOptions } from './types/locator.type';

export default createFromInvertly;
