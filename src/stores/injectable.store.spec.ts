import { InjectableStore } from './injectable.store';

describe('InjectableStore', () => {
  it('stores and retrieves injectable options by token', () => {
    class FooService {}

    const store = new InjectableStore();
    const options = { token: FooService, scopeable: false, singleton: true };

    store.push(options);

    expect(store.request(FooService)).toBe(options);
  });

  it('overwrites options registered under the same token', () => {
    class FooService {}

    const store = new InjectableStore();

    store.push({ token: FooService, scopeable: false, singleton: false });
    store.push({ token: FooService, scopeable: true, singleton: false });

    expect(store.request(FooService)?.scopeable).toBe(true);
  });

  it('returns undefined for tokens never registered', () => {
    class UnknownService {}

    const store = new InjectableStore();

    expect(store.request(UnknownService)).toBeUndefined();
  });
});
