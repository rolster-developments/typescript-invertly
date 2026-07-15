import { ScopeStore } from './scope.store';

describe('ScopeStore', () => {
  it('stores and retrieves instances by token', () => {
    class FooService {}

    const store = new ScopeStore();
    const instance = new FooService();

    store.push(FooService, instance);

    expect(store.request(FooService)).toBe(instance);
  });

  it('supports string and symbol tokens', () => {
    const store = new ScopeStore();
    const token = Symbol('SCOPE_TOKEN');

    store.push('SCOPE_KEY', 'valueA');
    store.push(token, 'valueB');

    expect(store.request('SCOPE_KEY')).toBe('valueA');
    expect(store.request(token)).toBe('valueB');
  });

  it('returns undefined for tokens never pushed', () => {
    const store = new ScopeStore();

    expect(store.request('UNKNOWN')).toBeUndefined();
  });
});
