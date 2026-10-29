import { LocatorClassOptions } from '../types/locator.type';
import { findInLocator, pushInLocator, saveInLocator } from './locator.store';

describe('LocatorStore', () => {
  it('registers a class under a string alias with pushInLocator', () => {
    class FooService {}

    pushInLocator('LOCATOR_FOO', FooService);

    expect(findInLocator('LOCATOR_FOO')).toEqual({
      token: FooService,
      useClass: FooService
    });
  });

  it('registers locator options directly with pushInLocator', () => {
    class BarService {}

    const options = { token: 'LOCATOR_BAR', useClass: BarService };

    pushInLocator(options);

    expect(findInLocator('LOCATOR_BAR')).toBe(options);
  });

  it('ignores a string reference without class token', () => {
    pushInLocator('LOCATOR_ORPHAN');

    expect(findInLocator('LOCATOR_ORPHAN')).toBeUndefined();
  });

  it('registers multiple dependencies with saveInLocator', () => {
    class ServiceA {}
    class ServiceB {}

    const tokenA = Symbol('LOCATOR_A');
    const tokenB = Symbol('LOCATOR_B');

    saveInLocator([
      { token: tokenA, useClass: ServiceA },
      { token: tokenB, useClass: ServiceB, singleton: true }
    ]);

    const optionsA = findInLocator(tokenA) as Undefined<LocatorClassOptions>;
    const optionsB = findInLocator(tokenB) as Undefined<LocatorClassOptions>;

    expect(optionsA?.useClass).toBe(ServiceA);
    expect(optionsB?.singleton).toBe(true);
  });

  it('returns undefined for tokens never registered', () => {
    expect(findInLocator('LOCATOR_UNKNOWN')).toBeUndefined();
  });
});
