import { invertly } from '../factories/invertly.factory';
import { Injectable } from './injectable.decorator';

describe('Injectable', () => {
  it('registers the class in the global container', () => {
    @Injectable()
    class PlainService {}

    expect(invertly(PlainService)).toBeInstanceOf(PlainService);
  });

  it('creates a new instance per request by default', () => {
    @Injectable()
    class TransientService {}

    expect(invertly(TransientService)).not.toBe(invertly(TransientService));
  });

  it('returns the same instance when registered as singleton', () => {
    @Injectable({ singleton: true })
    class SingletonService {}

    expect(invertly(SingletonService)).toBe(invertly(SingletonService));
  });
});
