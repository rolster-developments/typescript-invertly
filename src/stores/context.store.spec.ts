import { Context } from './context.store';

describe('Context', () => {
  it('saves and retrieves values by key', () => {
    const context = new Context();

    context.save('userId', 100);

    expect(context.findByKey('userId')).toBe(100);
    expect(context.findOrNullByKey('userId')).toBe(100);
  });

  it('returns undefined for keys never saved', () => {
    const context = new Context();

    expect(context.findOrNullByKey('unknown')).toBeUndefined();
  });

  it('reports whether a key is contained', () => {
    const context = new Context();

    context.save('present');

    expect(context.contain('present')).toBe(true);
    expect(context.contain('absent')).toBe(false);
  });
});
