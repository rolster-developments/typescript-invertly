import { Context } from '../stores/context.store';
import { pushInLocator, saveInLocator } from '../stores/locator.store';
import {
  createFromInvertly,
  InvertlyContainer,
  registerInjectable
} from './invertly.factory';

import 'reflect-metadata';

describe('createFromInvertly', () => {
  it('resolves a class token registered as injectable', () => {
    class FooService {}

    const container = new InvertlyContainer();

    registerInjectable(
      { token: FooService, scopeable: false, singleton: false },
      container
    );

    const instance = createFromInvertly({ token: FooService }, container);

    expect(instance).toBeInstanceOf(FooService);
  });

  it('resolves a string token registered in locator', () => {
    class BarService {}

    const container = new InvertlyContainer();

    registerInjectable(
      { token: BarService, scopeable: false, singleton: false },
      container
    );

    pushInLocator('BAR_SERVICE', BarService);

    const instance = createFromInvertly({ token: 'BAR_SERVICE' }, container);

    expect(instance).toBeInstanceOf(BarService);
  });

  it('resolves a symbol token from locator options when class is not registered as injectable', () => {
    const BAZ_TOKEN = Symbol('BAZ_SERVICE');

    class BazService {}

    const container = new InvertlyContainer();

    saveInLocator([
      { token: BAZ_TOKEN, useClass: BazService, singleton: true }
    ]);

    const first = createFromInvertly({ token: BAZ_TOKEN }, container);
    const second = createFromInvertly({ token: BAZ_TOKEN }, container);

    expect(first).toBeInstanceOf(BazService);
    expect(second).toBe(first);
  });

  it('throws when token is not registered', () => {
    class UnknownService {}

    const container = new InvertlyContainer();

    expect(() =>
      createFromInvertly({ token: UnknownService }, container)
    ).toThrow('is not found in the collection');
  });

  it('returns the same instance for singleton injectables', () => {
    class SingletonService {}

    const container = new InvertlyContainer();

    registerInjectable(
      { token: SingletonService, scopeable: false, singleton: true },
      container
    );

    const first = createFromInvertly({ token: SingletonService }, container);
    const second = createFromInvertly({ token: SingletonService }, container);

    expect(second).toBe(first);
  });

  it('resolves constructor params from design:paramtypes metadata', () => {
    class ReflectDep {}

    class ReflectParent {
      constructor(public dep: ReflectDep) {}
    }

    Reflect.defineMetadata('design:paramtypes', [ReflectDep], ReflectParent);

    const container = new InvertlyContainer();

    registerInjectable(
      { token: ReflectParent, scopeable: false, singleton: false },
      container
    );

    const instance = createFromInvertly<ReflectParent>(
      { token: ReflectParent },
      container
    );

    expect(instance.dep).toBeInstanceOf(ReflectDep);
  });

  it('resolves abstract constructor params through the locator', () => {
    abstract class AbstractRepository {}

    class Repository extends AbstractRepository {}

    class RepositoryParent {
      constructor(public repository: AbstractRepository) {}
    }

    Reflect.defineMetadata(
      'design:paramtypes',
      [AbstractRepository],
      RepositoryParent
    );

    saveInLocator([{ token: AbstractRepository, useClass: Repository }]);

    const container = new InvertlyContainer();

    registerInjectable(
      { token: RepositoryParent, scopeable: false, singleton: false },
      container
    );

    const instance = createFromInvertly<RepositoryParent>(
      { token: RepositoryParent },
      container
    );

    expect(instance.repository).toBeInstanceOf(Repository);
  });

  it('injects the resolution context when a param type is Context', () => {
    class ContextParent {
      constructor(public context: Context) {}
    }

    Reflect.defineMetadata('design:paramtypes', [Context], ContextParent);

    const container = new InvertlyContainer();

    registerInjectable(
      { token: ContextParent, scopeable: false, singleton: false },
      container
    );

    const context = new Context();

    context.save('requestId', 'abc-123');

    const instance = createFromInvertly<ContextParent>(
      { token: ContextParent, context },
      container
    );

    expect(instance.context).toBe(context);
    expect(instance.context.findByKey('requestId')).toBe('abc-123');
  });
});
