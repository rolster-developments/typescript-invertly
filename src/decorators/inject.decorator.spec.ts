import { invertly } from '../factories/invertly.factory';
import { pushInLocator } from '../stores/locator.store';
import { Factory, Scope, Singleton } from './inject.decorator';
import { Injectable } from './injectable.decorator';

describe('inject decorators', () => {
  it('Factory injects a new dependency instance per resolution', () => {
    class FactoryDep {}

    pushInLocator('FACTORY_DEP', FactoryDep);

    @Injectable()
    class FactoryParent {
      constructor(@Factory('FACTORY_DEP') public dep: FactoryDep) {}
    }

    const first = invertly<FactoryParent>(FactoryParent);
    const second = invertly<FactoryParent>(FactoryParent);

    expect(first.dep).toBeInstanceOf(FactoryDep);
    expect(second.dep).not.toBe(first.dep);
  });

  it('Factory injects a class token without locator registration', () => {
    class DirectDep {}

    @Injectable()
    class DirectParent {
      constructor(@Factory(DirectDep) public dep: DirectDep) {}
    }

    const instance = invertly<DirectParent>(DirectParent);

    expect(instance.dep).toBeInstanceOf(DirectDep);
  });

  it('Singleton injects the same dependency in every resolution', () => {
    class SingletonDep {}

    pushInLocator('SINGLETON_DEP', SingletonDep);

    @Injectable()
    class SingletonParent {
      constructor(@Singleton('SINGLETON_DEP') public dep: SingletonDep) {}
    }

    const first = invertly<SingletonParent>(SingletonParent);
    const second = invertly<SingletonParent>(SingletonParent);

    expect(first.dep).toBeInstanceOf(SingletonDep);
    expect(second.dep).toBe(first.dep);
  });

  it('Scope shares the dependency within a single resolution only', () => {
    class ScopeDep {}

    pushInLocator('SCOPE_DEP', ScopeDep);

    @Injectable()
    class ScopeParent {
      constructor(
        @Scope('SCOPE_DEP') public depA: ScopeDep,
        @Scope('SCOPE_DEP') public depB: ScopeDep
      ) {}
    }

    const first = invertly<ScopeParent>(ScopeParent);
    const second = invertly<ScopeParent>(ScopeParent);

    expect(first.depA).toBeInstanceOf(ScopeDep);
    expect(first.depA).toBe(first.depB);
    expect(second.depA).not.toBe(first.depA);
  });
});
