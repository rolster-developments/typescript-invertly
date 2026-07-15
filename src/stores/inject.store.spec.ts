import { InjectStore } from './inject.store';

describe('InjectStore', () => {
  it('registers injects under their parent at the given index', () => {
    class Parent {}
    class DepA {}
    class DepB {}

    const store = new InjectStore();

    store.push({
      index: 1,
      parent: Parent,
      scopeable: false,
      singleton: false,
      token: DepB
    });

    store.push({
      index: 0,
      parent: Parent,
      scopeable: false,
      singleton: false,
      token: DepA
    });

    const injects = store.request(Parent);

    expect(injects).toHaveLength(2);
    expect(injects[0].token).toBe(DepA);
    expect(injects[1].token).toBe(DepB);
  });

  it('returns an empty collection for parents without injects', () => {
    class LonelyParent {}

    const store = new InjectStore();

    expect(store.request(LonelyParent)).toEqual([]);
  });
});
