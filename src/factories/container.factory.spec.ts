import { pushInLocator, saveInLocator } from '../stores/locator.store';
import {
  createFromInvertly,
  InvertlyContainer,
  registerInjectable
} from './invertly.factory';

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
});
