import {
  createFromInvertly,
  invertly,
  InvertlyContainer,
  registerDependency
} from './invertly.factory';

describe('invertly', () => {
  it('resolves a token from the global container', () => {
    class GlobalService {}

    registerDependency(GlobalService, {});

    expect(invertly(GlobalService)).toBeInstanceOf(GlobalService);
  });
});

describe('registerDependency', () => {
  it('registers a class with its constructor injects', () => {
    class DepA {}
    class DepB {}

    class Composite {
      constructor(
        public depA: DepA,
        public depB: DepB
      ) {}
    }

    const container = new InvertlyContainer();

    registerDependency(Composite, {
      container,
      injects: [{ token: DepA }, { token: DepB }]
    });

    const instance = createFromInvertly<Composite>(
      { token: Composite },
      container
    );

    expect(instance.depA).toBeInstanceOf(DepA);
    expect(instance.depB).toBeInstanceOf(DepB);
  });

  it('respects explicit inject indexes', () => {
    class DepA {}
    class DepB {}

    class Ordered {
      constructor(
        public depA: DepA,
        public depB: DepB
      ) {}
    }

    const container = new InvertlyContainer();

    registerDependency(Ordered, {
      container,
      injects: [
        { token: DepB, index: 1 },
        { token: DepA, index: 0 }
      ]
    });

    const instance = createFromInvertly<Ordered>({ token: Ordered }, container);

    expect(instance.depA).toBeInstanceOf(DepA);
    expect(instance.depB).toBeInstanceOf(DepB);
  });

  it('registers a singleton dependency', () => {
    class SingletonService {}

    const container = new InvertlyContainer();

    registerDependency(SingletonService, { container, singleton: true });

    const first = createFromInvertly(
      { token: SingletonService },
      container
    );
    const second = createFromInvertly(
      { token: SingletonService },
      container
    );

    expect(second).toBe(first);
  });
});
